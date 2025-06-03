import axios from "axios";
import { FileText, Library, NotepadText, SquareX, Text } from "lucide-react";
import { FC, useEffect, useState } from "react";

import { DocumentStatus, SourceType } from "@/const";
import { DocumentContent, SourceDocument } from "@/types/document";
import DocumentList from "./DocumentList";
import Dropzone from "./Dropzone";
import LoadingSpinner from "./LoadingSpinner";
import ZoteroConnect from "./ZoteroConnect";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ImportDocumentProps {
  onSubmit: (documents: SourceDocument[]) => void;
  onBack: () => void;
}

const ImportDocument: FC<ImportDocumentProps> = ({ onSubmit, onBack }) => {
  const [importChoice, setImportChoice] = useState<SourceType>(SourceType.UNKNOWN);
  const [text, setText] = useState<string>("");
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (documents.length === 0) {
      setImportChoice(SourceType.UNKNOWN);
      setCollapsed(true);
    }
  }, [documents]);

  const extractDOIs = (text: string): string[] => {
    const doiRegex = /\b10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+\b/g;
    const matches = text.match(doiRegex);
    return matches ? matches.map(item => item.trim()) : [];
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handlePDFChange = (newPdfs: File[]) => {
    setPdfs(newPdfs);
  };

  const handleBack = () => {
    setImportChoice(SourceType.UNKNOWN);
    setText("");
  };

  const handleDOIs = async () => {
    if (isLoading) return;
    setLoading(true);

    const dois = extractDOIs(text);

    try {
      const response = await axios.post(`${API_URL}/api/document/doi`, {
        dois: dois
      });
      const fetchedDocuments = response.data.documents;
      const doiDocuments: SourceDocument[] = fetchedDocuments
        .filter((document: DocumentContent) => document)
        .map((doc: DocumentContent) => ({
          type: SourceType.DOI,
          title: doc.title,
          content: doc.content,
          status: doc?.oa_status || DocumentStatus.LABEL,
          authors: doc?.authors,
          publicationYear: doc?.publication_year
        }));
      handleAddDocuments(doiDocuments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setText("");
    }
  };

  const handlePDFs = async () => {
    if (isLoading) return;
    setLoading(true);

    const pdfDocuments: SourceDocument[] = [];

    for (const pdf of pdfs) {
      const formData = new FormData();
      formData.append("file", pdf);

      try {
        const response = await axios.post(`${API_URL}/api/document/pdf`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        if (response.status === 200) {
          const data = response.data;
          let references = [];
          let chunks = [];
          try {
            const refResponse = await axios.post(
              `${API_URL}/api/document/extract-references`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data"
                }
              }
            );

            if (refResponse.status === 200) {
              references = refResponse.data?.data?.references || [];
              chunks = refResponse.data?.data?.chunks || [];
            }
          } catch (refError) {
            console.error("Error extracting references:", refError);
          }
          pdfDocuments.push({
            type: SourceType.PDF,
            title: data.title,
            status: DocumentStatus.LABEL,
            content: data.text,
            authors: data?.authors,
            publicationYear: data?.publication_year,
            references,
            chunks
          });
        }
      } catch (error) {
        console.error("Error extracting PDF:", error);
      }
    }

    handleAddDocuments(pdfDocuments);
    handlePDFChange([]);

    setLoading(false);
  };

  const handleText = () => {
    if (isLoading) return;
    setLoading(true);

    const newDocument = {
      type: SourceType.TEXT,
      title: "Untitled",
      status: DocumentStatus.LABEL,
      content: text
    };

    handleAddDocuments([newDocument]);
    setText("");

    setLoading(false);
  };

  const handleAddDocuments = (newDocuments: SourceDocument[]) => {
    setDocuments([
      ...documents,
      ...newDocuments.filter((doc: SourceDocument) => doc.content.length > 0)
    ]);
  };

  const handleAddToGraph = () => {
    onSubmit(documents);
    setDocuments([]);
  };

  const handleCollapsed = (isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prevItems => prevItems.filter((_, idx) => idx !== index));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const auth_success = urlParams.get("auth_success");

    auth_success && setImportChoice(SourceType.ZOTERO);
  }, []);

  useEffect(() => {
    if (importChoice === SourceType.ZOTERO) {
      const urlParams = new URLSearchParams(window.location.search);
      const auth_success = urlParams.get("auth_success");

      if (auth_success) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("auth_success");

        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [importChoice]);

  return (
    <div
      className={`relative h-full transition-transform duration-500 ease-out transform rounded-lg shadow-lg bg-white dark:bg-[#121212] p-5 overflow-y-auto ${
        collapsed ? "translate-x-0" : "translate-x-[500px]"
      }`}
    >
      {documents.length > 0 && (
        <DocumentList
          documents={documents}
          collapsed={collapsed}
          sourceType={importChoice}
          onAddToGraph={handleAddToGraph}
          onCollapsed={handleCollapsed}
          onRemoveDocument={handleRemoveDocument}
        />
      )}
      <SquareX
        className="absolute top-4 right-4 cursor-pointer"
        strokeWidth={1.3}
        onClick={onBack}
      />
      <div className="flex flex-row items-center gap-2">
        <div className="h-2 w-2 rounded-full border-2 border-[#777C83]" />
        <span>Select Type</span>
      </div>
      <div className="my-4 rounded-md border-2 border-[#E5E8EC] grid grid-rows-2 grid-cols-2">
        <div
          className={`px-10 py-8 flex items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-all duration-200 border-r-2 border-b-2 rounded-tl-md ${
            importChoice === SourceType.DOI
              ? "bg-[#AFE8BD]"
              : "bg-white dark:bg-[#121212] hover:bg-gray-100"
          }`}
          onClick={() => setImportChoice(SourceType.DOI)}
        >
          <NotepadText strokeWidth={1.3} />
          DOI
        </div>
        <div
          className={`px-10 py-8 flex items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-all duration-200 border-b-2 rounded-tr-md ${
            importChoice === SourceType.PDF
              ? "bg-[#AFE8BD]"
              : "bg-white dark:bg-[#121212]  hover:bg-gray-100"
          }`}
          onClick={() => setImportChoice(SourceType.PDF)}
        >
          <FileText strokeWidth={1.3} />
          PDF
        </div>
        <div
          className={`px-10 py-8 flex items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-all duration-200 border-r-2 rounded-bl-md ${
            importChoice === SourceType.TEXT
              ? "bg-[#AFE8BD]"
              : "bg-white dark:bg-[#121212] hover:bg-gray-100"
          }`}
          onClick={() => setImportChoice(SourceType.TEXT)}
        >
          <Text strokeWidth={1.3} />
          Text
        </div>
        <div
          className={`px-10 py-8 flex items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-all duration-200 rounded-br-md ${
            importChoice === SourceType.ZOTERO
              ? "bg-[#AFE8BD]"
              : "bg-white dark:bg-[#121212] hover:bg-gray-100"
          }`}
          onClick={() => setImportChoice(SourceType.ZOTERO)}
        >
          <Library strokeWidth={1.3} />
          Zotero
        </div>
      </div>
      {importChoice === SourceType.DOI && (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row items-center gap-2">
            <div className="h-2 w-2 rounded-full border-2 border-[#777C83]" />
            <span>Type DOIs</span>
            {isLoading && <LoadingSpinner />}
          </div>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Separated by commas for multiple DOI’s"
            className="w-full h-24 rounded-sm p-4 outline-none text-sm bg-gray-100 dark:bg-[#202020] overflow-auto resize-none"
            style={{
              lineHeight: "1.5"
            }}
          />
          {text.length > 0 && (
            <button
              className="w-[100px] rounded-[10px] border-2 border-[#D0D3D9] py-3"
              onClick={handleDOIs}
            >
              Done
            </button>
          )}
        </div>
      )}
      {importChoice === SourceType.PDF && (
        <div className="flex flex-col gap-3 w-full overflow-y-auto">
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-row items-center gap-2">
              <div className="h-2 w-2 rounded-full border-2 border-[#777C83]" />
              Upload Documents
              {isLoading && <LoadingSpinner />}
            </div>
          </div>
          <Dropzone
            acceptedFileTypes={["application/pdf"]}
            pdfs={pdfs}
            onChange={handlePDFChange}
          />
          {pdfs.length > 0 && (
            <button
              className="w-[100px] rounded-[10px] border-2 border-[#D0D3D9] py-3"
              onClick={handlePDFs}
            >
              Done
            </button>
          )}
        </div>
      )}
      {importChoice === SourceType.TEXT && (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-row items-center gap-2">
              <div className="h-2 w-2 rounded-full border-2 border-[#777C83]" />
              Type a Text
              {isLoading && <LoadingSpinner />}
            </div>
          </div>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Paste text here..."
            className="w-full h-28 rounded-sm p-4 resize-none outline-none text-sm bg-gray-100 dark:bg-[#202020]"
            style={{
              overflowY: "auto",
              whiteSpace: "pre-wrap"
            }}
          />
          {text.length > 0 && (
            <button
              className="w-[100px] rounded-[10px] border-2 border-[#D0D3D9] py-3"
              onClick={handleText}
            >
              Done
            </button>
          )}
        </div>
      )}
      {importChoice === SourceType.ZOTERO && (
        <ZoteroConnect addDocuments={handleAddDocuments} onBack={handleBack} />
      )}
    </div>
  );
};

export default ImportDocument;
