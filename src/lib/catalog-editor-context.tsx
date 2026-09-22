"use client";

import * as React from "react";
import type { CatalogPageSize, CatalogOrientation } from "./catalog-geometry";

export const CatalogEditorContext = React.createContext<{
  pageSize?: CatalogPageSize;
  orientation?: CatalogOrientation;
}>({
  pageSize: "A4",
  orientation: "portrait",
});

export const useCatalogEditorContext = () => React.useContext(CatalogEditorContext);
