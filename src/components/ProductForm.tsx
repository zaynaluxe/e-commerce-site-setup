import { useState, useRef, ChangeEvent } from 'react';
import { 
  X, Upload, Trash2, Save, Eye, Code, Image, Type, 
  Maximize2, ArrowLeftRight, Package, DollarSign, 
  Tag, Palette, Ruler, FileText, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Product } from '../types';
import { uploadImage } from '../services/supabaseService';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

// Helper function to detect HTML content
const hasHtmlContent = (text: string): boolean => {
  return /<(?=.*? )(?!(?:p|br|strong|b|em|i|u|h[1-6]|ul|ol|li|a|img|span|div)\b)[a-z]+[^>]*>/i.test(text) || 
         /<img/i.test(text) || 
         /<a\s/i.test(text);
};

type ImageSize = 'small' | 'medium' | 'large' | 'full';

const getImageStyle = (size: ImageSize): string => {
  switch (size) {
    case 'small':
      return 'max-width:30%; height:auto; border-radius:8px; margin:10px 0;';
    case 'medium':
      return 'max-width:50%; height:auto; border-radius:8px; margin:10px 0;';
    case 'large':
      return 'max-width:75%; height:auto; border-radius:8px; margin:10px 0;';
    case 'full':
    default:
      return 'max-width:100%; height:auto; border-radius:8px; margin:10px 0;';
  }
};

// Check if file is an image (supports all image types including GIF)
const isImageFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const isImageType = file.type.startsWith('image/');
  const isGif = fileName.endsWith('.gif') || file.type === 'image/gif';
  const isImageExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff?|ico)$/i.test(fileName);
  return isImageType || isGif || isImageExtension;
};

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price?.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    description: product?.description || '',
    category: product?.category || 'jewelry',
    subcategory: product?.subcategory || '',
    colors: product?.colors?.join(', ') || '',
    sizes: product?.sizes?.join(', ') || '',
    inStock: product?.inStock ?? true,
    isNew: product?.isNew || false,
  });

  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>(product?.textDirection || 'ltr');

  const [images, setImages] = useState<string[]>(product?.images || (product?.image ? [product.image] : []));
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(() => 
    product?.description ? hasHtmlContent(product.description) : false
  );
  const [showPreview, setShowPreview] = useState(false);
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>('full');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionImageInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type = 'text' } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (isImageFile(file)) {
        // Show progress
        setUploadProgress(prev => ({ ...prev, [i]: 0 }));
        
        // Simulate progress
        setTimeout(() => setUploadProgress(prev => ({ ...prev, [i]: 50 })), 100);
        
        const url = await uploadImage(file);
        
        setUploadProgress(prev => ({ ...prev, [i]: 100 }));
        
        if (url) {
          uploadedUrls.push(url);
        }
      }
    }
    
    if (uploadedUrls.length > 0) {
      setImages(prev => [...prev, ...uploadedUrls]);
    }
    
    setUploadingImages(false);
    setUploadProgress({});
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const insertImageTag = (imageUrl?: string) => {
    const url = imageUrl || images[0] || 'https://images.unsplash.com/photo-1616837874254-8f5f9f4f7c5c?w=500&auto=format&fit=crop';
    const imgTag = `\n<img src="${url}" alt="Image" style="${getImageStyle(selectedImageSize)}" />\n`;
    setFormData(prev => {
      const currentDesc = prev.description || '';
      let updatedDesc = currentDesc;
      
      // If there's existing content without proper HTML structure, wrap it in <p> first
      if (currentDesc.trim() && !currentDesc.includes('<p>') && !currentDesc.includes('<br>')) {
        updatedDesc = `<p>${currentDesc}</p>`;
      }
      
      // Add image in a new paragraph to preserve line breaks
      return { ...prev, description: updatedDesc + imgTag };
    });
    if (!showPreview) {
      setShowPreview(true);
    }
  };

  const handleDescriptionImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isImageFile(file)) {
        // Upload to Supabase
        const url = await uploadImage(file);
        
        if (url) {
          insertImageTag(url);
        } else {
          // Fallback to base64 if upload fails
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            insertImageTag(result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData: Partial<Product> = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        description: formData.description || '',
        textDirection: textDirection,
        category: formData.category as Product['category'],
        subcategory: formData.subcategory || undefined,
        image: images[0] || 'https://images.unsplash.com/photo-1616837874254-8f5f9f4f7c5c?w=500&auto=format&fit=crop',
        images: images,
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : undefined,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : undefined,
        inStock: formData.inStock,
        isNew: formData.isNew,
      };

      onSave(productData);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {product ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
              </h3>
              <p className="text-neutral-300 text-sm">
                {product ? 'Mettez à jour les informations du produit' : 'Remplissez les informations du nouveau produit'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-180px)]">
          
          {/* Section: Images */}
          <div className="bg-neutral-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Photos du produit</h4>
                <p className="text-sm text-neutral-500">Ajoutez jusqu'à 5 photos de votre produit</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-neutral-900 bg-neutral-100 scale-[1.02]' 
                      : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100'
                  }`}
                >
                  <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-neutral-500" />
                  </div>
                  <p className="text-neutral-700 font-medium mb-1">
                    Glissez-déposez vos images ici
                  </p>
                  <p className="text-neutral-400 text-sm mb-3">
                    ou cliquez pour sélectionner depuis votre PC
                  </p>
                  <p className="text-xs text-neutral-400 bg-neutral-200 inline-block px-3 py-1 rounded-full">
                    JPG, PNG, GIF • Maximum 5 photos
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.gif"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploadingImages}
                />
                
                {uploadingImages && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
                      <span className="text-sm text-neutral-600">Téléchargement...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              <div>
                {images.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-700">
                        {images.length} photo{images.length > 1 ? 's' : ''} sélectionnée{images.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-1 rounded">
                        Cliquer sur × pour supprimer
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-neutral-200 group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-neutral-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                              Principale
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                            title="Supprimer cette image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-200 rounded-2xl p-8">
                    <Image className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-neutral-500">Aucune image ajoutée</p>
                    <p className="text-xs text-neutral-400">Ajoutez des photos pour votre produit</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Informations de base */}
          <div className="bg-neutral-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Informations de base</h4>
                <p className="text-sm text-neutral-500">Les détails essentiels de votre produit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Collier doré en acier inoxydable"
                    className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Prix (DH) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="299.00"
                      className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Prix promo
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="number"
                      name="originalPrice"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="399.00"
                      className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all appearance-none bg-white"
                    >
                      <option value="jewelry">Bijoux</option>
                      <option value="watches">Montres</option>
                      <option value="hijabs">Hijabs</option>
                      <option value="accessories">Accessoires</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Sous-catégorie
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      placeholder="Ex: Colliers"
                      className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Couleurs disponibles
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      name="colors"
                      value={formData.colors}
                      onChange={handleInputChange}
                      placeholder="Or, Argent, Rose"
                      className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tailles
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      name="sizes"
                      value={formData.sizes}
                      onChange={handleInputChange}
                      placeholder="S, M, L, XL"
                      className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Description */}
          <div className="bg-neutral-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">Description</h4>
                  <p className="text-sm text-neutral-500">Décrivez votre produit en détail</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Direction Toggle */}
                <button
                  type="button"
                  onClick={() => setTextDirection(prev => prev === 'ltr' ? 'rtl' : 'ltr')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    textDirection === 'rtl'
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  {textDirection === 'ltr' ? '← Gauche à Droite' : 'Droite à Gauche →'}
                </button>
                {/* Mode Toggle */}
                <div className="flex items-center bg-neutral-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setIsHtmlMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      !isHtmlMode 
                        ? 'bg-white text-neutral-900 shadow-md' 
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Texte
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHtmlMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isHtmlMode 
                        ? 'bg-white text-neutral-900 shadow-md' 
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    HTML
                  </button>
                </div>
                {/* Preview Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`p-3 rounded-xl transition-colors ${
                    showPreview 
                      ? 'bg-neutral-900 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                  title="Prévisualiser"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description Input/Preview */}
            {showPreview ? (
              <div className="min-h-[200px] p-5 border-2 border-neutral-200 rounded-xl bg-white overflow-auto" dir={textDirection}>
                {isHtmlMode ? (
                  <div 
                    className="text-neutral-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formData.description || '<p class="text-neutral-400 italic">Aucune description</p>' }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-neutral-700 leading-relaxed font-normal" dir={textDirection}>
                    {formData.description || 'Aucune description'}
                  </p>
                )}
              </div>
            ) : (
              <>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  dir={textDirection}
                  placeholder={
                    isHtmlMode 
                      ? '<p>Décrivez votre produit...</p>\n<img src="url" alt="Image" />' 
                      : "Décrivez votre produit en détail..."
                  }
                  className="w-full px-5 py-4 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all resize-none font-mono text-sm"
                />
                
                {/* HTML Mode Toolbar */}
                {isHtmlMode && (
                  <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-xl space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-600 font-medium">Taille:</span>
                        <div className="flex gap-1">
                          {(['small', 'medium', 'large', 'full'] as ImageSize[]).map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setSelectedImageSize(size)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                selectedImageSize === size
                                  ? 'bg-neutral-900 text-white'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {size === 'small' && '30%'}
                              {size === 'medium' && '50%'}
                              {size === 'large' && '75%'}
                              {size === 'full' && '100%'}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <input
                        ref={descriptionImageInputRef}
                        type="file"
                        accept="image/*,.gif"
                        onChange={handleDescriptionImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => descriptionImageInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Importer depuis PC
                      </button>
                    </div>
                    
                    {isHtmlMode && (
                      <DescriptionImageGallery 
                        description={formData.description} 
                        onRemove={(imgTagToRemove) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            description: prev.description.replace(imgTagToRemove, '') 
                          }));
                        }}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section: Statut */}
          <div className="bg-neutral-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Statut du produit</h4>
                <p className="text-sm text-neutral-500">Gérez la disponibilité et l'état de votre produit</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                formData.inStock && !formData.isNew
                  ? 'border-neutral-900 bg-neutral-900 text-white' 
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}>
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">En stock</span>
              </label>
              
              <label className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                formData.isNew
                  ? 'border-neutral-900 bg-neutral-900 text-white' 
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}>
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <span className="text-xl">✨</span>
                <span className="font-medium">Nouveau produit</span>
              </label>
              
              <label className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                !formData.inStock
                  ? 'border-red-500 bg-red-500 text-white' 
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}>
                <input
                  type="checkbox"
                  name="outOfStock"
                  checked={!formData.inStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, inStock: !e.target.checked }))}
                  className="hidden"
                />
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Rupture de stock</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-8 py-4 border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors font-semibold text-neutral-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-xl hover:from-neutral-800 hover:to-neutral-700 transition-all font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {product ? 'Enregistrer les modifications' : 'Ajouter le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component to display and manage images in description
function DescriptionImageGallery({ description, onRemove }: { description: string; onRemove: (imgTag: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const extractImages = (html: string): { url: string; fullTag: string }[] => {
    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
    const images: { url: string; fullTag: string }[] = [];
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      images.push({
        url: match[1],
        fullTag: match[0]
      });
    }
    
    return images;
  };
  
  const images = extractImages(description);
  
  if (images.length === 0) return null;
  
  return (
    <div className="mt-4 border border-neutral-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-neutral-600" />
          <span className="font-medium text-neutral-700">
            {images.length} image{images.length > 1 ? 's' : ''} dans la description
          </span>
        </div>
        <span className="text-neutral-500 text-sm">
          {isExpanded ? 'Masquer ▲' : 'Afficher ▼'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-white grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={img.url}
                alt={`Description image ${idx + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-neutral-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x80/f5f5f5/666?text=Erreur';
                }}
              />
              <button
                type="button"
                onClick={() => onRemove(img.fullTag)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Supprimer cette image"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

