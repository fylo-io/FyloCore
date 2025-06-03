"use client";
import axios from "axios";
import { FileText, FolderClosed, FolderOpen, Library, NotepadText, Plus, Text } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

import { DocumentStatus, SourceType } from "@/const";
import { SourceDocument } from "@/types/document";
import DocumentBadge from "./DocumentBadge";
import LoadingSpinner from "./LoadingSpinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Collection {
  key: string;
  name: string;
  parentCollection: string | null;
}

interface Item {
  DOI?: string;
  url?: string;
  key: string;
  title: string;
  collections?: Array<string | boolean>;
  document?: SourceDocument;
}

interface ZoteroConnectProps {
  addDocuments: (newDocuments: SourceDocument[]) => void;
  onBack: () => void;
}

interface CollectionNodeProps {
  collection: Collection;
  renderCollectionHierarchy: (
    parentCollectionKey: string | boolean | null,
    collections: Collection[],
    getItemsForCollection: (key: string | boolean | null) => Item[]
  ) => JSX.Element;
  getItemsForCollection: (key: string | boolean | null) => Item[];
  collections: Collection[];
  onAddDocuments: (documents: SourceDocument[]) => void;
  onLoading: (loading: boolean) => void;
}

interface FetchedDocument {
  title: string;
  content: string;
  oa_status?: DocumentStatus;
  authors?: string[];
  publication_year?: string;
}

const CollectionNode: FC<CollectionNodeProps> = ({
  collection,
  renderCollectionHierarchy,
  getItemsForCollection,
  collections,
  onAddDocuments,
  onLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddDocument = async (items: Item[]) => {
    onLoading(true);
    const response = await axios.post(`${API_URL}/api/document/doi`, {
      dois: items.map(item => item.DOI).filter(Boolean)
    });
    const fetchedDocuments: FetchedDocument[] = response.data.documents;
    const zoteroDocuments: SourceDocument[] = fetchedDocuments.map(doc => ({
      type: SourceType.ZOTERO,
      title: doc.title,
      content: doc.content,
      status: doc?.oa_status || DocumentStatus.LABEL,
      authors: doc?.authors,
      publicationYear: Number(doc?.publication_year)
    }));

    const missedItems = items.filter(item => !item.DOI);
    for (const missedItem of missedItems) {
      if (missedItem.url) {
        const res = await axios.post(`${API_URL}/api/document/url`, {
          url: missedItem.url
        });
        if (res.status === 200) {
          const text = res.data.text;
          zoteroDocuments.push({
            type: SourceType.ZOTERO,
            title: missedItem.title,
            content: text,
            status: DocumentStatus.LABEL
          });
        }
      }
    }
    onAddDocuments(zoteroDocuments);
    onLoading(false);
  };

  const getAllItemsForCollection = (collectionKey: string | boolean | null): Item[] => {
    const itemsInCollection = getItemsForCollection(collectionKey);
    const childCollections = collections.filter(
      (col: Collection) => col.parentCollection === collectionKey
    );
    const allItems = [...itemsInCollection];
    childCollections.forEach((childCollection: Collection) => {
      allItems.push(...getAllItemsForCollection(childCollection.key));
    });
    return allItems;
  };

  return (
    <li className="my-1">
      <div className="flex flex-row justify-between items-center group hover:text-blue-500">
        <div className="flex flex-row gap-1">
          <span
            className="mr-2 text-black cursor-pointer group-hover:text-blue-500"
            onClick={toggleExpand}
          >
            {isExpanded ? <FolderOpen strokeWidth={1.3} /> : <FolderClosed strokeWidth={1.3} />}
          </span>
          <strong className="text-black">{collection.name}</strong>
        </div>
        <Plus
          strokeWidth={1.3}
          className="cursor-pointer"
          onClick={() => handleAddDocument(getAllItemsForCollection(collection.key))}
        />
      </div>

      {isExpanded && (
        <div className="pl-5">
          {renderCollectionHierarchy(collection.key, collections, getItemsForCollection)}

          <ul>
            {getItemsForCollection(collection.key).map((item: Item) => (
              <div
                key={`document-${item.key}`}
                className="flex flex-row items-center justify-between cursor-pointer hover:text-blue-500"
                onClick={() => handleAddDocument([item])}
              >
                {item?.document?.type === SourceType.DOI && <NotepadText strokeWidth={1.3} />}
                {item?.document?.type === SourceType.PDF && <FileText strokeWidth={1.3} />}
                {item?.document?.type === SourceType.TEXT && <Text strokeWidth={1.3} />}
                {item?.document?.type === SourceType.ZOTERO && <Library strokeWidth={1.3} />}
                <div className={`flex items-center justify-between gap-4 py-1 w-[90%]`}>
                  <span className="truncate max-w-[180px]">{item.title}</span>
                  <DocumentBadge status={item?.document?.status || DocumentStatus.LABEL} />
                </div>
              </div>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

const ZoteroConnect: FC<ZoteroConnectProps> = ({ addDocuments }) => {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchZoteroData = async () => {
      try {
        const response = await axios.get("/api/zotero/data");
        const { collections: fetchedCollections, items: fetchedItems } = response.data;
        const zoteroItems: Item[] = [];

        for (const item of fetchedItems) {
          const newItem: Item = {
            ...item.data
          };
          if (!newItem.DOI) {
            try {
              const res = await axios.post("/api/zotero/getPdfText", {
                fileUrl: item.links.enclosure.href
              });
              zoteroItems.push({ ...newItem, url: res.data.url });
            } catch (error) {
              console.error("Error fetching PDF text:", error);
              zoteroItems.push(newItem);
            }
          } else {
            zoteroItems.push(newItem);
          }
        }

        setItems(zoteroItems);
        setCollections(
          fetchedCollections.map((collection: { data: Collection }) => collection.data)
        );
        setLoading(false);
        localStorage.removeItem("zotero-connecting");
      } catch (err) {
        const error = err as { status?: number; message?: string };

        if (error.status === 401) {
          localStorage.setItem("zotero-connecting", "true");
          router.push(`/api/zotero/connect?state=${encodeURIComponent(window.location.href)}`);
          return;
        }

        console.error("Failed to fetch Zotero data:", error.message || "Unknown error");
        setLoading(false);
      }
    };

    fetchZoteroData();
  }, [router]);

  const getItemsForCollection = (collectionKey: string | boolean | null): Item[] => {
    return items.filter(item => item.collections?.includes(collectionKey as string | boolean));
  };

  const renderCollectionHierarchy = (
    parentCollectionKey: string | boolean | null,
    collections: Collection[],
    getItemsForCollection: (key: string | boolean | null) => Item[]
  ): JSX.Element => {
    const filteredCollections = collections.filter(
      collection => collection.parentCollection === parentCollectionKey
    );

    return (
      <ul className="pl-1">
        {filteredCollections.map(collection => (
          <CollectionNode
            key={collection.key}
            collection={collection}
            renderCollectionHierarchy={renderCollectionHierarchy}
            getItemsForCollection={getItemsForCollection}
            collections={collections}
            onAddDocuments={addDocuments}
            onLoading={(loadingStatus: boolean) => setLoading(loadingStatus)}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="h-full w-full">
      <div className="flex flex-row items-center gap-3">
        <div className="h-2 w-2 rounded-full border-2 border-[#777C83]" />
        Import from Zotero
        {loading && <LoadingSpinner />}
      </div>
      <div className="mt-2 h-[85%] overflow-y-auto">
        {renderCollectionHierarchy(false, collections, getItemsForCollection)}
      </div>
    </div>
  );
};

export default ZoteroConnect;
