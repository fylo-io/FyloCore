import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FileTextIcon,
  FlaskConical
} from "lucide-react";
import { FC, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface MethodNodeProps {
  data: {
    id: string;
    description: string;
    conductedDate: string;
    protocol: string;
    results: Array<{ id: string; description: string }>;
    artifacts: Array<{ id: string; name: string; type: string }>;
    methods: Array<{ id: string; name: string }>;
  };
}

const MethodNode: FC<MethodNodeProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => setIsExpanded(prev => !prev);

  return (
    <div className="w-[300px] h-auto relative flex justify-center items-center">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
        <Card className="w-[300px] backdrop-blur-md bg-card/10 backdrop-opacity-100 shadow-lg hover:shadow-xl rounded-3xl h-fit">
          <Handle type="target" position={Position.Top} className="opacity-0" />

          <CardHeader
            className="ring-offset-4 ring-1 ring-primary/30 bg-accent text-primary p-2 cursor-pointer rounded-3xl"
            onClick={toggleExpand}
            role="button"
            aria-expanded={isExpanded}
            aria-controls="method-content"
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FlaskConical strokeWidth={1.5} className="ml-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-lg font-light tracking-wide">Method {data.id}</span>
              </div>
              {isExpanded ? (
                <ChevronUpIcon className="h-5 w-5 flex-shrink-0" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 flex-shrink-0" />
              )}
            </CardTitle>
          </CardHeader>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className={`overflow-hidden`}
          >
            <CardContent id="method-content" className="py-4 px-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-4">
                <Badge variant="outline" className="font-light pl-1.5">
                  <CalendarIcon strokeWidth={2} className="mr-1 h-3 w-3" />
                  {data.conductedDate}
                </Badge>
                <Badge variant="outline" className="font-light pl-1.5">
                  <FileTextIcon strokeWidth={2} className="mr-1 h-3 w-3" />
                  {data.protocol}
                </Badge>
              </div>

              <p className="text-sm mb-4 font-light tracking-wide">{data.description}</p>
            </CardContent>
          </motion.div>

          <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </Card>
      </motion.div>
    </div>
  );
};

export default MethodNode;
