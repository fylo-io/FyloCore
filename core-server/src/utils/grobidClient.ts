import fs from 'fs';

import axios from 'axios';
import FormData from 'form-data';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';

import { handleErrors } from './errorHandler';

const GROBID_HOST = process.env.GROBID_HOST;

export interface Reference {
  ref_id: string;
  title: string;
  authors: string[];
  year: string;
  doi?: string | null;
  url?: string | null;
}

export interface TextChunk {
  id: string;
  content: string;
  section_title: string;
  section_number: string;
  position: number;
}

interface ProcessingResult {
  references: Reference[];
  total_references: number;
  chunks: TextChunk[];
  total_chunks: number;
  processed_at: string;
}

/**
 * Process a PDF file with GROBID to extract references and sections
 * @param filePath Path to the PDF file
 * @returns Object containing extracted references and sections
 */
export const processReferencesPdf = async (filePath: string): Promise<ProcessingResult> => {
  try {
    // Verify the file exists before proceeding
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Create a FormData instance using the form-data package
    const formData = new FormData();
    formData.append('input', fs.createReadStream(filePath));

    const response = await axios.post(`${GROBID_HOST}/api/processFulltextDocument`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.status !== 200) {
      throw new Error(`GROBID processing failed: ${response.statusText}`);
    }

    // Process the XML response
    const xmlContent = response.data;
    const references = extractReferencesFromXml(xmlContent);
    const chunks = extractTextChunks(xmlContent);

    return {
      references,
      total_references: references.length,
      chunks,
      total_chunks: chunks.length,
      processed_at: new Date().toISOString(),
    };
  } catch (error) {
    handleErrors('Error processing PDF with GROBID:', error as Error);
    throw new Error(`Failed to process references: ${(error as Error).message}`);
  }
};

/**
 * Extract complete sections from GROBID XML output
 * @param xmlContent XML string from GROBID
 * @returns Array of sections as text chunks
 */
const extractTextChunks = (xmlContent: string): TextChunk[] => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    // Set up namespace resolver for xpath
    const select = xpath.useNamespaces({ tei: 'http://www.tei-c.org/ns/1.0' });

    const chunks: TextChunk[] = [];
    let chunkCounter = 0;

    // Process abstract as its own section
    const abstractNode = select('//tei:abstract', doc, true) as Node;
    if (abstractNode?.textContent) {
      const abstractText = abstractNode.textContent.trim();
      if (abstractText.length > 0) {
        chunks.push({
          id: `section-${chunkCounter++}`,
          content: abstractText,
          section_title: 'Abstract',
          section_number: '0',
          position: 0,
        });
      }
    }

    // Process main sections
    let position = 1;

    // Helper function to process sections recursively
    const processSections = (nodes: Node[], parentNum = '') => {
      let localCounter = 1;

      for (const div of nodes) {
        // Get section heading
        const headNode = select('.//tei:head', div, true) as Node;
        const sectionTitle = headNode?.textContent?.trim() || `Section ${localCounter}`;

        // Skip bibliography/reference sections
        if (/references|bibliography/i.test(sectionTitle)) {
          continue;
        }

        // Check if this is a top-level section
        const sectionNum = parentNum ? `${parentNum}.${localCounter}` : `${localCounter}`;

        // Get all paragraphs directly in this section (not in subsections)
        const directParas = select('./tei:p', div) as Node[];
        let sectionContent = '';

        // First add the heading content if there is any
        if (headNode?.textContent) {
          sectionContent = headNode.textContent.trim() + '\n\n';
        }

        // Then add paragraph content
        for (const p of directParas) {
          if (p?.textContent) {
            const paragraphText = p.textContent.trim();
            sectionContent += (sectionContent.length > 0 ? '\n\n' : '') + paragraphText;
          }
        }

        // Get figures and tables within this section
        const figures = select('./tei:figure', div) as Node[];
        for (const fig of figures) {
          const figDesc = select('.//tei:figDesc', fig, true) as Node;
          if (figDesc?.textContent) {
            sectionContent += '\n\n[Figure: ' + figDesc.textContent.trim() + ']';
          }
        }

        const tables = select('./tei:table', div) as Node[];
        for (const table of tables) {
          const tableDesc = select('.//tei:head', table, true) as Node;
          if (tableDesc?.textContent) {
            sectionContent += '\n\n[Table: ' + tableDesc.textContent.trim() + ']';
          }
        }

        // Only create a chunk if we have content
        if (sectionContent.trim().length > 0) {
          chunks.push({
            id: `section-${chunkCounter++}`,
            content: sectionContent.trim(),
            section_title: sectionTitle,
            section_number: sectionNum,
            position: position++,
          });
        }

        // Process subsections recursively
        const subDivs = select('./tei:div', div) as Node[];
        if (subDivs.length > 0) {
          processSections(subDivs, sectionNum);
        }

        localCounter++;
      }
    };

    // Start recursive processing with top-level sections
    const topLevelDivs = select('//tei:body/tei:div', doc) as Node[];
    processSections(topLevelDivs);

    // If no structured content found, fall back to extracting intro, body, and conclusion
    if (chunks.length <= 1) {
      // Only abstract or nothing
      // Try to identify introduction
      const introParas = select(
        "//tei:body//tei:div[contains(translate(.//tei:head, 'INTRODUCTION', 'introduction'), 'introduction')]//tei:p",
        doc,
      ) as Node[];
      if (introParas.length > 0) {
        let introContent = '';
        for (const p of introParas) {
          if (p?.textContent) {
            introContent += (introContent.length > 0 ? '\n\n' : '') + p.textContent.trim();
          }
        }
        if (introContent.length > 0) {
          chunks.push({
            id: `section-${chunkCounter++}`,
            content: introContent,
            section_title: 'Introduction',
            section_number: '1',
            position: position++,
          });
        }
      }

      // Try to extract method section
      const methodParas = select(
        "//tei:body//tei:div[contains(translate(.//tei:head, 'METHODS', 'methods'), 'methods') or contains(translate(.//tei:head, 'METHODOLOGY', 'methodology'), 'methodology')]//tei:p",
        doc,
      ) as Node[];
      if (methodParas.length > 0) {
        let methodContent = '';
        for (const p of methodParas) {
          if (p?.textContent) {
            methodContent += (methodContent.length > 0 ? '\n\n' : '') + p.textContent.trim();
          }
        }
        if (methodContent.length > 0) {
          chunks.push({
            id: `section-${chunkCounter++}`,
            content: methodContent,
            section_title: 'Methods',
            section_number: '2',
            position: position++,
          });
        }
      }

      // Try to extract results section
      const resultParas = select(
        "//tei:body//tei:div[contains(translate(.//tei:head, 'RESULTS', 'results'), 'results')]//tei:p",
        doc,
      ) as Node[];
      if (resultParas.length > 0) {
        let resultContent = '';
        for (const p of resultParas) {
          if (p?.textContent) {
            resultContent += (resultContent.length > 0 ? '\n\n' : '') + p.textContent.trim();
          }
        }
        if (resultContent.length > 0) {
          chunks.push({
            id: `section-${chunkCounter++}`,
            content: resultContent,
            section_title: 'Results',
            section_number: '3',
            position: position++,
          });
        }
      }

      // Try to extract discussion section
      const discussionParas = select(
        "//tei:body//tei:div[contains(translate(.//tei:head, 'DISCUSSION', 'discussion'), 'discussion')]//tei:p",
        doc,
      ) as Node[];
      if (discussionParas.length > 0) {
        let discussionContent = '';
        for (const p of discussionParas) {
          if (p?.textContent) {
            discussionContent +=
              (discussionContent.length > 0 ? '\n\n' : '') + p.textContent.trim();
          }
        }
        if (discussionContent.length > 0) {
          chunks.push({
            id: `section-${chunkCounter++}`,
            content: discussionContent,
            section_title: 'Discussion',
            section_number: '4',
            position: position++,
          });
        }
      }

      // Try to identify conclusion
      const conclusionParas = select(
        "//tei:body//tei:div[contains(translate(.//tei:head, 'CONCLUSION', 'conclusion'), 'conclusion')]//tei:p",
        doc,
      ) as Node[];
      if (conclusionParas.length > 0) {
        let conclusionContent = '';
        for (const p of conclusionParas) {
          if (p?.textContent) {
            conclusionContent +=
              (conclusionContent.length > 0 ? '\n\n' : '') + p.textContent.trim();
          }
        }
        if (conclusionContent.length > 0) {
          chunks.push({
            id: `section-${chunkCounter++}`,
            content: conclusionContent,
            section_title: 'Conclusion',
            section_number: '5',
            position: position++,
          });
        }
      }

      // Last resort - get all paragraphs if we still have no content
      if (chunks.length <= 1) {
        const allParas = select('//tei:body//tei:p', doc) as Node[];
        if (allParas.length > 0) {
          let content = '';
          for (const p of allParas) {
            if (p?.textContent) {
              content += (content.length > 0 ? '\n\n' : '') + p.textContent.trim();
            }
          }
          if (content.length > 0) {
            chunks.push({
              id: `section-${chunkCounter++}`,
              content: content,
              section_title: 'Main Content',
              section_number: '1',
              position: position++,
            });
          }
        }
      }
    }

    return chunks;
  } catch (error) {
    handleErrors('Error extracting sections from XML:', error as Error);
    return [];
  }
};

/**
 * Extract references from GROBID XML output
 * @param xmlContent XML string from GROBID
 * @returns Array of references
 */
const extractReferencesFromXml = (xmlContent: string): Reference[] => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    // Set up namespace resolver for xpath
    const select = xpath.useNamespaces({ tei: 'http://www.tei-c.org/ns/1.0' });

    const references: Reference[] = [];

    // Add self-reference (current document)
    const titleEl = select('//tei:titleStmt/tei:title', doc, true) as Node;
    const doiEl = select('//tei:sourceDesc//tei:idno[@type="DOI"]', doc, true) as Node;

    let urlText = null;
    // Try to find URL in sourceDesc
    const urlEls = select('//tei:sourceDesc//tei:ptr[@target]', doc) as Node[];
    if (urlEls && urlEls.length) {
      for (const el of urlEls) {
        const target = (el as Element).getAttribute('target');
        if (target && (target.startsWith('http://') || target.startsWith('https://'))) {
          urlText = target;
          break;
        }
      }
    }

    // Add self-reference
    references.push({
      ref_id: 'self',
      title: titleEl?.textContent || 'Current Document',
      authors: [], // Empty as requested in the original code
      year: new Date().getFullYear().toString(),
      doi: doiEl?.textContent || null,
      url: urlText,
    });

    // Extract bibliography references
    const refNodes = select('//tei:listBibl//tei:biblStruct', doc) as Node[];

    for (let i = 0; i < refNodes.length; i++) {
      const ref = refNodes[i];
      try {
        const refElement = ref as Element;
        const refId = refElement.getAttribute('xml:id') || `ref-${i + 1}`;

        const titleEl = select('.//tei:title', ref, true) as Node;
        const titleText = titleEl?.textContent || null;

        const authors: string[] = [];
        const authorNodes = select('.//tei:author', ref) as Node[];

        for (const author of authorNodes) {
          const nameParts: string[] = [];

          const forenameEl = select('.//tei:forename', author, true) as Node;
          const surnameEl = select('.//tei:surname', author, true) as Node;

          if (forenameEl?.textContent) nameParts.push(forenameEl.textContent);
          if (surnameEl?.textContent) nameParts.push(surnameEl.textContent);

          if (nameParts.length) {
            authors.push(nameParts.join(' '));
          }
        }

        const dateEl = select('.//tei:date', ref, true) as Element;
        const year = dateEl?.getAttribute('when') || dateEl?.textContent || null;

        // DOI extraction - try multiple paths
        let doiText = null;

        // 1. Try the standard DOI element
        const doiEl = select('.//tei:idno[@type="DOI"]', ref, true) as Node;
        if (doiEl?.textContent) {
          doiText = doiEl.textContent.trim();
        }

        // 2. If not found, try note elements that might contain DOI
        if (!doiText) {
          const noteEls = select('.//tei:note', ref) as Node[];
          for (const note of noteEls) {
            const noteText = note?.textContent || '';
            const doiMatch = noteText.match(/doi:\s*(10\.\d+\/[^\s]+)/i);
            if (doiMatch && doiMatch[1]) {
              doiText = doiMatch[1].trim();
              break;
            }
          }
        }

        // 3. Search in any element for DOI pattern
        if (!doiText) {
          const allElements = select('.//*', ref) as Node[];
          for (const el of allElements) {
            const text = el?.textContent || '';
            const doiMatch = text.match(/doi:\s*(10\.\d+\/[^\s]+)/i);
            if (doiMatch && doiMatch[1]) {
              doiText = doiMatch[1].trim().replace(/[.,]$/, ''); // Remove trailing period/comma
              break;
            }
          }
        }

        // URL extraction - try multiple approaches
        let urlText = null;

        // 1. Try standard URL pointer
        const urlEl = select('.//tei:ptr[@type="url"]', ref, true) as Element;
        if (urlEl?.getAttribute('target')) {
          urlText = urlEl.getAttribute('target');
        }

        // 2. Try any pointer with http/https target
        if (!urlText) {
          const ptrEls = select('.//tei:ptr[@target]', ref) as Element[];
          for (const ptr of ptrEls) {
            const target = ptr.getAttribute('target');
            if (target && (target.startsWith('http://') || target.startsWith('https://'))) {
              urlText = target;
              break;
            }
          }
        }

        // 3. Look for URL pattern in any text
        if (!urlText) {
          const allElements = select('.//*', ref) as Node[];
          for (const el of allElements) {
            const text = el?.textContent || '';
            const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
            if (urlMatch && urlMatch[1]) {
              urlText = urlMatch[1].trim().replace(/[.,]$/, ''); // Remove trailing period/comma
              break;
            }
          }
        }

        // 4. If we have a DOI but no URL, create a DOI-based URL
        if (doiText && !urlText) {
          urlText = `https://doi.org/${doiText}`;
        }

        references.push({
          ref_id: refId,
          title: titleText || 'Untitled Reference',
          authors,
          year: year || 'Unknown',
          doi: doiText,
          url: urlText,
        });
      } catch (error) {
        handleErrors('Error processing reference:', error as Error);
        handleErrors(`Failed to process reference at index ${i}:`, error as Error);
        continue;
      }
    }

    return references;
  } catch (error) {
    handleErrors('Error extracting references from XML:', error as Error);
    handleErrors('Failed to extract references from XML:', error as Error);
    return [];
  }
};

export { extractReferencesFromXml, extractTextChunks };
