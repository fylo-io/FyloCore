import https from 'https';

import axios from 'axios';
import pdfParse from 'pdf-parse';

import { OPENALEX_API_URL } from '../consts';

import { handleErrors } from './errorHandler';

export interface DocumentContent {
  title: string;
  content: string;
  source_type?: string;
  doi?: string;
  publication_year?: number;
  publication_date?: string;
  type?: string;
  is_oa?: boolean;
  oa_status?: string;
  authors?: string[];
}

export const extractContentFromUrl = async (url: string): Promise<string> => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Referer: 'https://academic.oup.com/',
    },
  });

  if (response.status !== 200) return '';

  const contentType = response.headers['content-type'];
  if (!contentType || !contentType.includes('application/pdf')) return '';
  const nodeBuffer = Buffer.from(response.data);
  const data = await pdfParse(nodeBuffer);

  return data.text;
};

export const fetchMetadataFromOpenAlex = async (
  doi: string,
): Promise<{
  id: string;
  title: string;
  status: string;
}> => {
  const response = await axios.get(`${OPENALEX_API_URL}?filter=doi:${doi}`);
  if (response.status === 200) {
    return {
      id: response.data.results[0].id,
      title: response.data.results[0].title,
      status: response.data.results[0].open_access?.is_oa ? 'Open Access' : 'Closed',
    };
  }
  throw new Error('Metadata retrieval failed from OpenAlex');
};

export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getContentFromPdfUrl = async (url: string): Promise<string> => {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      httpsAgent: agent,
    });

    const data = await pdfParse(Buffer.from(response.data));

    return data.text;
  } catch (error) {
    handleErrors('Error extracting PDF text:', error as Error);
    return '';
  }
};

export const getDocumentFromDoi = async (doi: string): Promise<DocumentContent | undefined> => {
  try {
    const response = await axios.get(`${OPENALEX_API_URL}?filter=doi:${doi}`);
    if (response.status === 200) {
      const result = response.data.results[0];
      const content = await getContentFromPdfUrl(
        result?.primary_location?.pdf_url || result?.open_access?.oa_url,
      );
      return {
        title: result.title,
        content: content,
        source_type: 'DOI',
        doi: doi,
        publication_year: result.publication_year,
        publication_date: result.publication_date,
        type: result.type,
        is_oa: result.open_access.is_oa,
        oa_status: result.open_access.oa_status,
        authors: result.authorships.map(
          (authorship: { author: { display_name: string } }) => authorship.author.display_name,
        ),
      };
    } else {
      return {
        title: `${doi} (DOI missing for date ${new Date().toDateString()})`,
        content: '',
      } as DocumentContent;
    }
  } catch (error) {
    handleErrors('Document Processing Error: ', error as Error);
  }
};
