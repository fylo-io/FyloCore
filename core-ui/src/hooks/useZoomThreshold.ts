import { useStore } from "@xyflow/react";

const ZOOM_THRESHOLD = 0.75;

export const useZoomThreshold = (): boolean => {
  const zoom = useStore(state => state.transform[2]);
  return zoom < ZOOM_THRESHOLD;
};
