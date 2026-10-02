// BeHealthier - backend (Express + MongoDB). Rodar: npm i && node server.js
const express=require('express'),mongoose=require('mongoose'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),cors=require('cors');
const app=express();app.use(cors(),express.json({limit:'2mb'}));
const SEC=process.env.JWT_SECRET||'troque-este-segredo';
const User=mongoose.model('User',new mongoose.Schema({nome:String,email:{type:String,unique:true,lowercase:true},senha:String,
  estado:{type:mongoose.Schema.Types.Mixed,default:{}}},{minimize:false}));
const out=u=>({token:jwt.sign({id:u._id},SEC,{expiresIn:'30d'}),user:{nome:u.nome,email:u.email}});
const auth=(q,s,n)=>{try{q.uid=jwt.verify((q.headers.authorization||'').slice(7),SEC).id;n()}catch(e){s.status(401).json({erro:'Sessão inválida'})}};
app.post('/api/register',async(q,s)=>{const{nome,email,senha}=q.body;
  if(!nome||!email||!senha||senha.length<6)return s.status(400).json({erro:'Dados inválidos'});
  if(await User.findOne({email}))return s.status(409).json({erro:'Este e-mail já está cadastrado'});
  s.json(out(await User.create({nome,email,senha:await bcrypt.hash(senha,10)})))});
app.post('/api/login',async(q,s)=>{const u=await User.findOne({email:(q.body.email||'').toLowerCase()});
  if(!u||!await bcrypt.compare(q.body.senha||'',u.senha))return s.status(401).json({erro:'E-mail ou senha incorretos'});s.json(out(u))});
app.get('/api/state',auth,async(q,s)=>s.json({estado:(await User.findById(q.uid)).estado}));
app.put('/api/state',auth,async(q,s)=>{await User.findByIdAndUpdate(q.uid,{estado:q.body.estado});s.json({ok:true})});
mongoose.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/behealthier').then(()=>app.listen(3000,()=>console.log('API em http://localhost:3000')));
