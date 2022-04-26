const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const Sequelize = require("sequelize");
const path = require("path");

const hbs = handlebars.create({defaultLayout: "main", runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
}});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const sequelize = new Sequelize("atividade", "root", "itlean", {
    host: "localhost",
    dialect: "mysql"
});

const Filmes = sequelize.define('filmes',{
    titulo: {
        type: Sequelize.STRING
    },
    capa: {
        type: Sequelize.STRING
    },
    sinopse: {
        type: Sequelize.TEXT
    },
    trailer: {
        type: Sequelize.STRING
    },
    categoria: {
        type: Sequelize.JSON
    },
    ja_assistiu: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
});

// Filmes.sync({force: true})

app.get("/salvar", function(req, res){
    res.render("admin/cadastro");
});
app.get('/',  function(req, res){
   Filmes.findAll({where:{ja_assistiu: true}}).then((assistiu) => {
        Filmes.findAll({where:{ja_assistiu: false}}).then((filmes) =>{
            filmes.map((val)=>{ 
                const converte = JSON.parse(val.categoria) 
                val.categoria = converte        
            });
            assistiu.map((val)=>{ 
                const converte = JSON.parse(val.categoria) 
                val.categoria = converte        
            });
            res.render("admin/index", { filmes: filmes, assistiu: assistiu});
        }).catch((err) => {
            res.send("nada" + err)
        })
    }).catch((err) => {
        res.send("erro" + err)
    })
});

app.post('/salvar', (req, res)=>{
    Filmes.create({
        titulo: req.body.titulo,
        capa: req.body.capa,
        sinopse: req.body.sinopse,
        trailer: req.body.trailer,
        categoria: req.body.categoria,
    }).then(function(){
        res.redirect('/')
    }).catch(function(err){
        res.send("erro" + err)
    })
});

app.get("/assistir/:id", async (req, res) => {
    const id = req.params.id
    await Filmes.findOne({where: {id: id}}).then(function(filme){
        filme.update({
            ja_assistiu: true   
        }, {where:{id: id }}).then(()=>{
            console.log(filme)
            res.redirect("/")
        }).catch((err)=>{
            res.send("errou " + err)
        })
    }).catch(function(err){
        res.send("Este filme não existe" + err)
    })
})

app.get("/tirar/:id", async (req, res) => {
    const id = req.params.id
    await Filmes.findOne({where: {id: id}}).then(function(filme){
        filme.update({
            ja_assistiu: false  
        }, {where:{id: id }}).then(()=>{
            res.redirect("/")
        }).catch((err)=>{
            res.send("errou " + err)
        })
    }).catch(function(err){
        res.send("Este filme não existe" + err)
    })
})

app.get('/deletar/:id', (req,res) => {
    Filmes.destroy({where:{id:req.params.id}}).then(function(){
        res.redirect("/")
    }).catch(function(err){
        res.send("Esta postagem não existe" + err)
    })
})

app.listen(8088, function(){
    console.log("Servidor rodando na url http://localhost:8088");
});