"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Palette,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  QrCode,
  ExternalLink,
  Edit2,
  Trash2,
  Upload,
  Loader2,
  Download,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { artworks: number };
}

interface Artwork {
  id: string;
  title: string;
  slug: string;
  description: string;
  dimensions: string;
  medium: string;
  yearCreated: number;
  hasGoldFoil: boolean;
  goldPurity: string | null;
  price: string | number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  primaryImageUrl: string;
  watermarkedWebpUrl: string;
  category: Category;
  categoryId: string;
  createdAt: string;
  _count?: { events: number; leads: number };
}

export default function ArtworksAdminPage() {
  const [artworks, setArtworks] = React.useState<Artwork[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Artwork Dialog (Create / Edit)
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingArtwork, setEditingArtwork] = React.useState<Artwork | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dimensions, setDimensions] = React.useState("24 x 36 inches");
  const [medium, setMedium] = React.useState("22k Gold Foil, Teakwood, Semi-Precious Gemstones");
  const [yearCreated, setYearCreated] = React.useState(new Date().getFullYear().toString());
  const [hasGoldFoil, setHasGoldFoil] = React.useState(true);
  const [goldPurity, setGoldPurity] = React.useState("22 Carat Jaipur Gold Leaf");
  const [price, setPrice] = React.useState("");
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [isFeatured, setIsFeatured] = React.useState(false);

  // Image Upload State
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [primaryImageUrl, setPrimaryImageUrl] = React.useState("");
  const [watermarkedWebpUrl, setWatermarkedWebpUrl] = React.useState("");
  const [protectedS3Key, setProtectedS3Key] = React.useState("");

  // QR Preview Modal
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = React.useState("");
  const [qrArtworkTitle, setQrArtworkTitle] = React.useState("");
  const [qrTargetSlug, setQrTargetSlug] = React.useState("");

  // Category Manager Modal
  const [categoryModalOpen, setCategoryModalOpen] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState("");
  const [newCatSlug, setNewCatSlug] = React.useState("");
  const [creatingCat, setCreatingCat] = React.useState(false);

  const reloadData = React.useCallback(() => {
    Promise.all([
      fetch("/api/admin/artworks").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/admin/categories").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([artworksData, categoriesData]) => {
        setArtworks(artworksData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error loading artworks data:", e);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/admin/artworks").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/admin/categories").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([artworksData, categoriesData]) => {
        if (isMounted) {
          setArtworks(artworksData);
          setCategories(categoriesData);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Error loading artworks data:", e);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingArtwork(null);
    setTitle("");
    setSlug("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setDimensions("24 x 36 inches");
    setMedium("22k Gold Foil, Teakwood, Semi-Precious Gemstones");
    setYearCreated(new Date().getFullYear().toString());
    setHasGoldFoil(true);
    setGoldPurity("22 Carat Jaipur Gold Leaf");
    setPrice("");
    setIsAvailable(true);
    setIsFeatured(false);
    setPrimaryImageUrl("");
    setWatermarkedWebpUrl("");
    setProtectedS3Key("");
    setDialogOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (art: Artwork) => {
    setEditingArtwork(art);
    setTitle(art.title);
    setSlug(art.slug);
    setCategoryId(art.categoryId);
    setDescription(art.description);
    setDimensions(art.dimensions);
    setMedium(art.medium);
    setYearCreated(art.yearCreated.toString());
    setHasGoldFoil(art.hasGoldFoil);
    setGoldPurity(art.goldPurity || "");
    setPrice(art.price ? art.price.toString() : "");
    setIsAvailable(art.isAvailable);
    setIsFeatured(art.isFeatured);
    setPrimaryImageUrl(art.primaryImageUrl);
    setWatermarkedWebpUrl(art.watermarkedWebpUrl);
    setDialogOpen(true);
  };

  // Handle File Upload to Sharp Pipeline
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPrimaryImageUrl(data.publicUrl);
        setWatermarkedWebpUrl(data.publicUrl);
        setProtectedS3Key(data.vaultKey);
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Auto-slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArtwork) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // Submit Artwork
  const handleSaveArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryImageUrl) {
      alert("Please upload a primary image for the artwork.");
      return;
    }

    setSaving(true);
    const payload = {
      title,
      slug,
      categoryId,
      description,
      dimensions,
      medium,
      yearCreated: parseInt(yearCreated, 10),
      hasGoldFoil,
      goldPurity: hasGoldFoil ? goldPurity : null,
      price: price ? parseFloat(price) : null,
      isAvailable,
      isFeatured,
      primaryImageUrl,
      watermarkedWebpUrl,
      protectedS3Key,
    };

    try {
      if (editingArtwork) {
        const res = await fetch(`/api/admin/artworks/${editingArtwork.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setDialogOpen(false);
          reloadData();
        }
      } else {
        const res = await fetch("/api/admin/artworks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setDialogOpen(false);
          reloadData();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to create artwork");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error saving artwork");
    } finally {
      setSaving(false);
    }
  };

  // Delete Artwork
  const handleDeleteArtwork = async (id: string, artTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${artTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/artworks/${id}`, { method: "DELETE" });
      if (res.ok) reloadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Open QR Preview
  const handleOpenQR = (art: Artwork) => {
    setQrArtworkTitle(art.title);
    setQrTargetSlug(art.slug);
    setQrPreviewUrl(`/media/qr-codes/${art.slug}.png`);
    setQrModalOpen(true);
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCat(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, slug: newCatSlug }),
      });
      if (res.ok) {
        setNewCatName("");
        setNewCatSlug("");
        reloadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingCat(false);
    }
  };

  // Filter artworks
  const filteredArtworks = artworks.filter((art) => {
    const matchesCategory =
      selectedCategory === "ALL" || art.categoryId === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.medium.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Vault &amp; Catalog Management
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            Artwork Catalog
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Curate Tanjore gold relief masterpieces, Mysore classical schools, dimensions, and exhibition QR scans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <FolderTree className="w-3.5 h-3.5" />
            Categories ({categories.length})
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Artwork
          </Button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-lg border border-border bg-card/60 backdrop-blur-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <Button
            variant={selectedCategory === "ALL" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory("ALL")}
            className={`h-8 text-xs shrink-0 ${
              selectedCategory === "ALL" ? "border border-primary/50 text-primary font-bold" : ""
            }`}
          >
            All Works ({artworks.length})
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={selectedCategory === c.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(c.id)}
              className={`h-8 text-xs shrink-0 ${
                selectedCategory === c.id ? "border border-primary/50 text-primary font-bold" : ""
              }`}
            >
              {c.name} ({c._count?.artworks ?? 0})
            </Button>
          ))}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search title, medium..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex items-center border border-border rounded-md p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-7 w-7 p-0"
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-7 w-7 p-0"
              title="Table View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading artwork vault...</span>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-serif font-bold text-base text-foreground">
            No Artworks Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? "No artworks match your query."
              : "Begin cataloging masterworks with 22k gold leaf relief details."}
          </p>
          <Button variant="gold" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Catalog First Artwork
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredArtworks.map((art) => (
            <Card
              key={art.id}
              className="overflow-hidden hover:border-primary/60 transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-[4/5] bg-muted/40 overflow-hidden">
                {art.watermarkedWebpUrl ? (
                  <Image
                    src={art.watermarkedWebpUrl}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Palette className="w-8 h-8 opacity-40" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-md">
                    {art.category?.name}
                  </Badge>
                  {art.hasGoldFoil && (
                    <Badge variant="gold" className="text-[9px]">
                      22k Gold Foil
                    </Badge>
                  )}
                </div>

                <div className="absolute top-2 right-2">
                  <Badge
                    variant={art.isAvailable ? "gold" : "outline"}
                    className="text-[10px] uppercase bg-background/80 backdrop-blur-md"
                  >
                    {art.isAvailable ? "Available" : "Acquired"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-serif font-bold text-sm text-foreground line-clamp-1">
                    {art.title}
                  </h4>
                  {art.price && (
                    <span className="font-mono text-xs font-bold text-primary shrink-0">
                      ₹{Number(art.price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {art.medium} • {art.dimensions}
                </p>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <Link
                    href={`/artwork/${art.slug}`}
                    target="_blank"
                    className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Public View
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenQR(art)}
                      className="h-7 w-7 p-0 text-foreground hover:text-primary"
                      title="Exhibition Floor QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(art)}
                      className="h-7 w-7 p-0"
                      title="Edit Artwork"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteArtwork(art.id, art.title)}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      title="Delete Artwork"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Preview</TableHead>
                <TableHead>Title &amp; Category</TableHead>
                <TableHead>Medium &amp; Dimensions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArtworks.map((art) => (
                <TableRow key={art.id}>
                  <TableCell>
                    <div className="w-10 h-12 rounded bg-muted/60 relative overflow-hidden">
                      {art.watermarkedWebpUrl && (
                        <Image
                          src={art.watermarkedWebpUrl}
                          alt={art.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-sm text-foreground">
                        {art.title}
                      </span>
                      <span className="text-[10px] text-primary font-mono">
                        {art.category?.name} • Year {art.yearCreated}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{art.medium}</div>
                    <div className="font-mono text-[11px]">{art.dimensions}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={art.isAvailable ? "gold" : "outline"} className="text-[10px]">
                      {art.isAvailable ? "Available" : "Acquired"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-primary">
                    {art.price ? `₹${Number(art.price).toLocaleString("en-IN")}` : "Inquire"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenQR(art)}
                        className="h-7 w-7 p-0"
                        title="QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(art)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteArtwork(art.id, art.title)}
                        className="h-7 w-7 p-0 text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Artwork Create / Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveArtwork}>
            <DialogHeader>
              <DialogTitle>
                {editingArtwork ? "Edit Masterwork" : "Catalog New Masterwork"}
              </DialogTitle>
              <DialogDescription>
                Define provenance, 22k gold leaf specifications, dimensions, and upload high-res imagery.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-left">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Masterwork High-Res Image (Watermarked Automatically)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-28 rounded-lg border-2 border-dashed border-border bg-muted/30 relative flex items-center justify-center overflow-hidden shrink-0">
                    {uploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : primaryImageUrl ? (
                      <Image
                        src={primaryImageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      id="artworkImage"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Original master is secured in private vault. Public WebP is stamped with &quot;© Lalita Kapilavai&quot;.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Title</label>
                  <Input
                    placeholder="e.g. Navaneetha Krishna with Yashoda"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">URL Slug</label>
                  <Input
                    placeholder="navaneetha-krishna"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Category & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Art Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Year Created</label>
                  <Input
                    type="number"
                    value={yearCreated}
                    onChange={(e) => setYearCreated(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Medium & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Medium Used</label>
                  <Input
                    placeholder="22k Gold Foil, Teakwood, Semi-Precious Gemstones"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Dimensions</label>
                  <Input
                    placeholder="e.g. 24 x 36 inches"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Gold Foil Details */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasGoldFoil"
                    checked={hasGoldFoil}
                    onChange={(e) => setHasGoldFoil(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="hasGoldFoil" className="text-xs font-semibold text-foreground">
                    Includes Authentic Gold Foil Relief Work
                  </label>
                </div>

                {hasGoldFoil && (
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Gold Purity / Certification</label>
                    <Input
                      placeholder="e.g. 22 Carat Jaipur Gold Leaf"
                      value={goldPurity}
                      onChange={(e) => setGoldPurity(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Price & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Price (₹ INR)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 150000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="isAvailable" className="text-xs font-medium text-foreground">
                    Available for Sale
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-medium text-foreground">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Artistic Commentary &amp; Provenance</label>
                <textarea
                  rows={3}
                  placeholder="Detailed iconographic description, spiritual symbolism, and Carnatic raga links..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={saving || uploadingImage}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Masterwork"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Preview Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Exhibition Floor QR Code</DialogTitle>
            <DialogDescription>
              Scan to view &quot;{qrArtworkTitle}&quot; with interactive lead capture and audio commentary.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-white rounded-xl shadow-lg border border-border">
              <Image
                src={qrPreviewUrl}
                alt="Exhibition QR Code"
                width={200}
                height={200}
                className="w-48 h-48"
                unoptimized
              />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              /artwork/{qrTargetSlug}?qr=true
            </span>
          </div>

          <DialogFooter className="sm:justify-center">
            <a href={qrPreviewUrl} download={`qr-${qrTargetSlug}.png`}>
              <Button variant="gold" size="sm" className="gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Download Print High-Res QR
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Management Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Traditional Art Categories</DialogTitle>
            <DialogDescription>
              Manage distinct classical painting schools and gallery taxonomy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Create category input */}
            <form onSubmit={handleCreateCategory} className="flex items-center gap-2">
              <Input
                placeholder="New Category Name..."
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setNewCatSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                  );
                }}
                className="h-8 text-xs"
                required
              />
              <Button
                type="submit"
                variant="gold"
                size="sm"
                className="h-8 text-xs shrink-0"
                disabled={creatingCat}
              >
                Add
              </Button>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded border border-border bg-card/60 text-xs"
                >
                  <span className="font-serif font-bold text-foreground">
                    {c.name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {c._count?.artworks ?? 0} artworks
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
