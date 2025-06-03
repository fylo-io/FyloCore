import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface ChatbotProps {
  sendMessages: (messages: string[]) => void;
}

interface PastedItem {
  id: string;
  text: string;
}

const Chatbot: FC<ChatbotProps> = ({ sendMessages }) => {
  const [inputValue, setInputValue] = useState("");
  const [pastedItems, setPastedItems] = useState<PastedItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedContent = e.clipboardData.getData("text");
    if (pastedContent.length > 50) {
      e.preventDefault();
      setPastedItems(prev => [...prev, { id: uuidv4(), text: pastedContent }]);
      setInputValue("");
    } else {
      setInputValue(pastedContent);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const removePastedItem = (id: string) => {
    setPastedItems(prev => prev.filter(item => item.id !== id));
    inputRef.current?.focus();
  };

  const handleAttachFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setPastedItems(prev => [...prev, { id: uuidv4(), text: content }]);
      };
      reader.readAsText(file);
    }
  };

  const handleSendPrompt = () => {
    const messages = [...pastedItems.map(item => item.text), inputValue].map(text => text.trim());
    sendMessages(messages);
    setInputValue("");
    setPastedItems([]);
  };

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-2 w-full flex items-center justify-center z-50">
      <div
        className="flex flex-col items-center max-w-3xl p-1 rounded-full"
        onMouseLeave={() => setIsExpanded(false)}
      >
        {pastedItems.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {pastedItems.map(item => (
              <div
                key={item.id}
                className="relative bg-gray-800 dark:bg-gray-200 rounded-lg p-3 pt-4 w-[140px] h-[90px] flex flex-col"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePastedItem(item.id)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-700 dark:bg-gray-300 p-0 hover:bg-gray-600 dark:hover:bg-gray-400"
                >
                  <X className="h-4 w-4 text-gray-300 dark:text-gray-900" />
                  <span className="sr-only">Remove pasted text</span>
                </Button>
                <p className="text-[10px] text-gray-300 dark:text-gray-900 line-clamp-3 flex-grow">
                  {item.text}
                </p>
                <div className="relative h-4 -mb-3">
                  <Badge
                    className="absolute left-1/2 transform -translate-x-1/2 translate-y-1/4 text-[10px]"
                    variant="secondary"
                  >
                    pasted
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          ref={containerRef}
          className={`relative flex items-center transition-all duration-300 ease-in-out ${
            isExpanded ? "w-full" : "w-[52px]"
          }`}
          onMouseEnter={() => setIsExpanded(true)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAttachFile}
            className={`absolute left-1.5 text-gray-400 dark:text-gray-600 hover:text-gray-300 dark:hover:text-gray-500 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-full p-2 transition-all duration-300 ease-in-out ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          <Input
            ref={inputRef}
            className={`w-full bg-gray-800 dark:bg-gray-200 border-gray-700 dark:border-gray-300 text-gray-100 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-700 pl-12 pr-24 py-4 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
            placeholder="Enter a prompt here"
            value={inputValue}
            onChange={handleInputChange}
            onPaste={handlePaste}
          />
          <div
            className={`absolute right-1.5 flex space-x-1 transition-all duration-300 ease-in-out ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSendPrompt}
              className="text-gray-400 dark:text-gray-600 hover:text-gray-300 dark:hover:text-gray-500 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-full p-2"
            >
              <ArrowUp className="h-5 w-5" />
              <span className="sr-only">Send prompt</span>
            </Button>
          </div>
          {!isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(true)}
              className="absolute left-1.5 bg-gray-900 dark:bg-gray-100 text-gray-400 dark:text-gray-600 hover:text-gray-300 dark:hover:text-gray-500 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-full p-2 transition-all duration-300 ease-in-out"
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Expand prompt bar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
