import mongoose from 'mongoose';
import Application from '../models/Application.js';

export default async function connectDB(){
	if(!process.env.MONGO_URI)throw new Error('MONGO_URI is missing. Configure server/.env');
	await mongoose.connect(process.env.MONGO_URI);
	let indexes=[];
	try{indexes=await Application.collection.indexes()}catch(e){if(e.code!==26)throw e}
	const legacy=indexes.find(index=>index.name==='candidateId_1_jobId_1'&&index.unique&&!index.partialFilterExpression);
	if(legacy)await Application.collection.dropIndex(legacy.name);
	await Application.createIndexes();
	console.log(`MongoDB connected: ${mongoose.connection.host}`)
}