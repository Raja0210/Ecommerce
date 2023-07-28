import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Spinner from "./Spinner";
import {ReactSortable} from "react-sortablejs";

export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription,
    price:existingPrice,
    images: existingImages,
}){
    const [title,setTitle]=useState(existingTitle || '');
    const [description,setDescription]=useState(existingDescription ||'');
    const [price,setPrice]=useState(existingPrice || '');
    const [images,setImages]=useState(existingImages || '');
    const [goToProducts,setGoToProducts]=useState(false);
    const [isUploading,setIsUploading]=useState(false);
    const router = useRouter();
    async function saveProduct(ev){
        ev.preventDefault();
        const data={title,description,price,images};
        if(_id){
            await axios.put('/api/products',{...data,_id});
        }
        else{
            await axios.post('/api/products', data);
        }
        setGoToProducts(true);
    }
    if(goToProducts){
        router.push('/products');
    }
    async function uploadImages(ev){
        const files = ev.target?.files;
        if(files?.length>0){
            setIsUploading(true);
            const data = new FormData();
            for(const file of files){
                data.append('file',file);
            }
            const res = await axios.post('/api/upload', data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }
    function updateImagesOrder(images){
        setImages(images);
    }
    return(
            <form onSubmit={saveProduct}>
                <label>Product Name</label>
                <input 
                    type="text" 
                    placeholder="product name" 
                    value={title} 
                    onChange={ev => setTitle(ev.target.value)}/>
                <label>
                    Photos
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                    <ReactSortable className="flex flex-wrap gap-2" list={images} setList={updateImagesOrder}>
                    {!!images?.length && images.map(link =>(
                        <div key={link} className="h-24">
                            <img src={link} alt="" className="rounded-lg" />
                        </div>
                    ))}
                    </ReactSortable>
                    {isUploading && (
                        <div className="h-24 p-1 flex items-center">
                            <Spinner/>
                        </div>
                    )}
                    <label className="w-24 h-24 cursor-pointer text-center flex items-center rounded-lg justify-center text-sm gap-1 text-gray-500 bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M11.47 1.72a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72V7.5h-1.5V4.06L9.53 5.78a.75.75 0 01-1.06-1.06l3-3zM11.25 7.5V15a.75.75 0 001.5 0V7.5h3.75a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9a3 3 0 013-3h3.75z" />
                        </svg>
                        <div>Upload</div>
                        <input type="file" onChange={uploadImages} className="hidden"/>
                    </label> 
                </div>
                <label>Description</label>
                <textarea 
                placeholder="description" 
                value={description} 
                onChange={ev => setDescription(ev.target.value) }/>
                <label>Price (INR)</label>
                <input 
                    type="number"
                    placeholder="price" 
                    value={price} 
                    onChange={ev => setPrice(ev.target.value) }/>
                <button 
                    type="submit" 
                    className="btn-primary">
                    Save
                </button>
            </form>
    );
}