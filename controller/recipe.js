const Recipes=require("../models/recipe")
const cloudinary = require('cloudinary').v2
const multer = require('multer')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure multer for memory storage (we'll upload to Cloudinary manually)
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Helper function to upload to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'food-recipes',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(file.buffer)
  })
}

const getRecipes=async(req,res)=>{
    const recipes=await Recipes.find()
    return res.json(recipes)
}

const getRecipe=async(req,res)=>{
    const recipe=await Recipes.findById(req.params.id)
    res.json(recipe)
}

const addRecipe=async(req,res)=>{
    try {
        console.log('User:', req.user)
        console.log('Body:', req.body)
        console.log('File:', req.file)
        
        const {title,ingredients,instructions,time}=req.body 

        if(!title || !ingredients || !instructions)
        {
            return res.status(400).json({message:"Required fields can't be empty"})
        }

        // Parse ingredients if it's a string
        let ingredientsArray = ingredients
        if (typeof ingredients === 'string') {
            ingredientsArray = ingredients.split(',').map(item => item.trim())
        }

        let coverImage = null
        if (req.file) {
            console.log('Uploading to Cloudinary...')
            const cloudinaryResult = await uploadToCloudinary(req.file)
            coverImage = cloudinaryResult.secure_url
            console.log('Cloudinary URL:', coverImage)
        }

        const newRecipe=await Recipes.create({
            title,
            ingredients: ingredientsArray,
            instructions,
            time,
            coverImage,
            createdBy:req.user.id
        })
        console.log('Recipe created:', newRecipe)
        return res.json(newRecipe)
    } catch (error) {
        console.error('Error creating recipe:', error)
        return res.status(500).json({message:"Server error", error: error.message})
    }
}

const editRecipe=async(req,res)=>{
    try {
        const {title,ingredients,instructions,time}=req.body 
        let recipe=await Recipes.findById(req.params.id)

        if(!recipe){
            return res.status(404).json({message:"Recipe not found"})
        }

        let coverImage = recipe.coverImage
        if (req.file) {
            const cloudinaryResult = await uploadToCloudinary(req.file)
            coverImage = cloudinaryResult.secure_url
        }
        
        const updatedRecipe = await Recipes.findByIdAndUpdate(req.params.id,{...req.body,coverImage},{new:true})
        res.json(updatedRecipe)
    }
    catch(err){
        console.error('Error updating recipe:', err)
        return res.status(500).json({message:"Server error"})
    }
}
const deleteRecipe=async(req,res)=>{
    try{
        const result = await Recipes.deleteOne({_id:req.params.id})
        if(result.deletedCount === 0){
            return res.status(404).json({message:"Recipe not found"})
        }
        res.json({status:"ok"})
    }
    catch(err){
        return res.status(500).json({message:"Server error"})
    }
}

module.exports={getRecipes,getRecipe,addRecipe,editRecipe,deleteRecipe,upload}