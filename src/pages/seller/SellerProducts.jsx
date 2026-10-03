import { useState } from "react";
import toast from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button, Drawer, Input, Select } from "../../components/ui";
import SellerProductFilters from "./SellerProductFilters";
import SellerProductTable from "./SellerProductTable";

const INITIAL_PRODUCTS = [
  { id: 101, name: "Áo Thun Nam Cotton Compact 100% Thoáng Mát", category: "Thời Trang Nam", price: 150000, originalPrice: 220000, stock: 45, sales: 142, status: "ACTIVE", sku: "AT-COMPACT-01", variants: [{ name: "Trắng / M", price: 150000, stock: 15, sku: "AT-01-W-M" }, { name: "Trắng / L", price: 150000, stock: 20, sku: "AT-01-W-L" }, { name: "Đen / L", price: 150000, stock: 10, sku: "AT-01-B-L" }], image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80", weightGram: 250 },
  { id: 102, name: "Quần Jean Nam Slimfit Co Giãn Cao Cấp", category: "Thời Trang Nam", price: 350000, originalPrice: 480000, stock: 18, sales: 89, status: "ACTIVE", sku: "QJ-SLIM-02", variants: [{ name: "Xanh Đậm / 30", price: 350000, stock: 8, sku: "QJ-02-D-30" }, { name: "Xanh Nhạt / 31", price: 350000, stock: 10, sku: "QJ-02-L-31" }], image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=300&q=80", weightGram: 550 },
  { id: 103, name: "Giày Sneaker Thể Thao Phối Màu Retro", category: "Giày Dép Nam", price: 550000, originalPrice: 750000, stock: 0, sales: 64, status: "OUT_OF_STOCK", sku: "SNK-RETRO-03", variants: [{ name: "Size 40", price: 550000, stock: 0, sku: "SNK-40" }, { name: "Size 41", price: 550000, stock: 0, sku: "SNK-41" }], image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80", weightGram: 800 },
  { id: 104, name: "Túi Đeo Chéo Canvas Chống Nước Tiện Lợi", category: "Túi & Balo", price: 200000, originalPrice: 280000, stock: 3, sales: 52, status: "ACTIVE", sku: "BAG-CANVAS-04", variants: [], image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80", weightGram: 350 },
  { id: 105, name: "Đồng Hồ Thông Minh Sport Theo Dõi Sức Khỏe", category: "Thiết Bị Điện Tử", price: 890000, originalPrice: 1200000, stock: 25, sales: 0, status: "PENDING", sku: "WATCH-SPORT-05", variants: [], image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80", weightGram: 180 },
];

const blankForm = { name: "", category: "Thời Trang Nam", price: "", originalPrice: "", stock: "", sku: "", weightGram: 300, description: "", image: "", hasVariants: false, variants: [{ name: "Size M", price: "", stock: "", sku: "" }, { name: "Size L", price: "", stock: "", sku: "" }] };

export default function SellerProducts() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(blankForm);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (activeTab === "ALL") return true;
    if (activeTab === "ACTIVE") return product.status === "ACTIVE";
    if (activeTab === "OUT_OF_STOCK") return product.stock === 0 || product.status === "OUT_OF_STOCK";
    return product.status === activeTab;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setForm({ ...blankForm, sku: `SKU-${Date.now().toString().slice(-4)}`, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80" });
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setForm({ name: product.name, category: product.category, price: product.price, originalPrice: product.originalPrice || "", stock: product.stock, sku: product.sku, weightGram: product.weightGram || 300, description: product.description || "Chất liệu cao cấp, bảo hành chính hãng.", image: product.image || "", hasVariants: Array.isArray(product.variants) && product.variants.length > 0, variants: Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [] });
    setShowModal(true);
  };

  const handleSaveProduct = (event) => {
    event.preventDefault();
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên sản phẩm"); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error("Vui lòng nhập giá bán hợp lệ"); return; }
    if (editingProduct) {
      setProducts((previous) => previous.map((product) => product.id === editingProduct.id ? { ...product, name: form.name, category: form.category, price: Number(form.price), originalPrice: Number(form.originalPrice) || Number(form.price), stock: Number(form.stock) || 0, sku: form.sku, weightGram: Number(form.weightGram) || 300, image: form.image || product.image, variants: form.hasVariants ? form.variants : [], status: Number(form.stock) > 0 ? "ACTIVE" : "OUT_OF_STOCK" } : product));
      toast.success("Cập nhật sản phẩm thành công!");
    } else {
      setProducts((previous) => [{ id: Date.now(), name: form.name, category: form.category, price: Number(form.price), originalPrice: Number(form.originalPrice) || Number(form.price), stock: Number(form.stock) || 0, sales: 0, sku: form.sku || `SKU-${Date.now().toString().slice(-4)}`, weightGram: Number(form.weightGram) || 300, image: form.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80", status: "ACTIVE", variants: form.hasVariants ? form.variants : [] }, ...previous]);
      toast.success("Thêm sản phẩm mới thành công!");
    }
    setShowModal(false);
  };

  const handleDeleteProduct = (id) => { if (globalThis.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) { setProducts((previous) => previous.filter((product) => product.id !== id)); setSelectedIds((previous) => previous.filter((item) => item !== id)); toast.success("Đã xóa sản phẩm khỏi gian hàng"); } };
  const handleDeleteSelected = () => { setProducts((previous) => previous.filter((product) => !selectedIds.includes(product.id))); setSelectedIds([]); toast.success("Đã xóa các sản phẩm được chọn"); };
  const handleToggleStatus = (id) => setProducts((previous) => previous.map((product) => { if (product.id !== id) return product; const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"; toast.success(nextStatus === "ACTIVE" ? "Đã hiển thị sản phẩm" : "Đã ẩn sản phẩm"); return { ...product, status: nextStatus }; }));
  const toggleSelectAll = () => setSelectedIds((previous) => previous.length === filteredProducts.length ? [] : filteredProducts.map((product) => product.id));
  const toggleSelectOne = (id) => setSelectedIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
  const updateForm = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  return <div className="space-y-5" data-density="compact">
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-primary">Kho hàng</p><h1 className="mt-1 text-ui-h1 font-semibold tracking-tight text-ink">Sản phẩm</h1><p className="mt-2 text-sm text-muted">Quản lý giá, tồn kho, biến thể và trạng thái hiển thị.</p></div><Button size="sm" density="compact" leftIcon={PlusIcon} onClick={handleOpenAddModal}>Thêm sản phẩm</Button></header>
    <section className="rounded-ui border border-border bg-surface p-4"><SellerProductFilters products={products} activeTab={activeTab} searchQuery={searchQuery} selectedIds={selectedIds} onTabChange={setActiveTab} onSearchChange={setSearchQuery} onDeleteSelected={handleDeleteSelected} /></section>
    <SellerProductTable products={filteredProducts} selectedIds={selectedIds} onToggleSelectAll={toggleSelectAll} onToggleSelectOne={toggleSelectOne} onToggleStatus={handleToggleStatus} onEdit={handleOpenEditModal} onDelete={handleDeleteProduct} />
    <Drawer open={showModal} onClose={() => setShowModal(false)} side="right" title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"} description="Cập nhật thông tin cốt lõi của sản phẩm." className="max-w-xl" density="compact"><form onSubmit={handleSaveProduct} className="space-y-4"><Input density="compact" label="Tên sản phẩm" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required /><div className="grid gap-4 sm:grid-cols-2"><Select density="compact" label="Danh mục" value={form.category} onChange={(event) => updateForm("category", event.target.value)}><option>Thời Trang Nam</option><option>Thời Trang Nữ</option><option>Giày Dép Nam</option><option>Túi & Balo</option><option>Thiết Bị Điện Tử</option><option>Mỹ Phẩm & Làm Đẹp</option></Select><Input density="compact" label="Mã SKU" value={form.sku} onChange={(event) => updateForm("sku", event.target.value)} /></div><div className="grid gap-4 sm:grid-cols-3"><Input density="compact" label="Giá bán (VNĐ)" type="number" value={form.price} onChange={(event) => updateForm("price", event.target.value)} required /><Input density="compact" label="Giá niêm yết" type="number" value={form.originalPrice} onChange={(event) => updateForm("originalPrice", event.target.value)} /><Input density="compact" label="Tồn kho" type="number" value={form.stock} onChange={(event) => updateForm("stock", event.target.value)} /></div><Input density="compact" label="URL hình ảnh" type="url" value={form.image} onChange={(event) => updateForm("image", event.target.value)} /><Input density="compact" label="Trọng lượng đóng gói (gram)" type="number" value={form.weightGram} onChange={(event) => updateForm("weightGram", event.target.value)} /><label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.hasVariants} onChange={(event) => updateForm("hasVariants", event.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" /> Sản phẩm có biến thể</label><div className="flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="secondary" size="sm" density="compact" onClick={() => setShowModal(false)}>Hủy</Button><Button type="submit" size="sm" density="compact">Lưu sản phẩm</Button></div></form></Drawer>
  </div>;
}
