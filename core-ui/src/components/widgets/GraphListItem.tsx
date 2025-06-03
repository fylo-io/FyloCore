import { useRouter } from "next/navigation";
import { FC } from "react";

interface GraphListItemProps {
  graph: {
    id: string;
    name: string;
    description: string;
  };
  isCreated: boolean;
  onDelete: (id: string) => void;
  onShare: (graphId: string) => void;
}

const GraphListItem: FC<GraphListItemProps> = ({ graph, isCreated, onDelete, onShare }) => {
  const router = useRouter();

  const handleOpen = () => {
    router.push(`/graph/${graph.id}`);
  };

  const handleDelete = () => {
    onDelete(graph.id);
  };

  const handleShare = () => {
    onShare(graph.id);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h2 className="text-xl font-bold">{graph.name}</h2>
      <p className="text-muted-foreground">{graph.description}</p>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleOpen}
          className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
        >
          Open
        </button>
        {isCreated && (
          <button
            onClick={handleShare}
            className="px-4 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
          >
            Share
          </button>
        )}
        {isCreated && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default GraphListItem;
