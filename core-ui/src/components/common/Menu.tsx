import { FC } from "react";

interface MenuProps {
  download: () => void;
  hideMenu: () => void;
  // eslint-disable-next-line
  uploadGraphDataFromJSON: (graphData: any) => void;
}

const Menu: FC<MenuProps> = ({ download, hideMenu, uploadGraphDataFromJSON }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === "string") {
          try {
            const parsedData = JSON.parse(e.target.result);
            uploadGraphDataFromJSON(parsedData);
          } catch (error) {
            console.error("Invalid JSON file:", error);
          }
        }
      };

      reader.readAsText(file);
    }
  };

  return (
    <div className="absolute top-[70px] left-7 flex flex-row gap-2">
      <div className="flex flex-col space-y-2 p-2 w-64 rounded-md shadow-md bg-white dark:bg-black h-[100px]">
        <span
          className="rounded-md p-2 cursor-pointer text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
          onClick={download}
        >
          Download Graph
        </span>
        <hr />
        <span
          className="rounded-md p-2 cursor-pointer text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          Upload from JSON
        </span>
      </div>
      <input
        type="file"
        id="fileInput"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Menu;
