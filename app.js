//carregando modulos
 
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const { Mongoose } = require('mongoose')
    const mongoose  = require('mongoose')
    const urlencodedParse = bodyParser.urlencoded({extended:true}); 
    const session = require('express-session')
    const flash = require('connect-flash')
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)

//configuracoes
    //Sessao
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    
    //Midleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next()
    })

    //body-parser  
        app.use(bodyParser.urlencoded({extended:true}))
        app.use(bodyParser.json())
    
    //handlebars
        app.set('views', path.join(__dirname, 'views'));
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))   
        app.set('view engine', 'handlebars')
    
    //mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp", {useNewUrlParser: true, useUnifiedTopology: true}).then(() =>{
            console.log("Conectado com sucesso!")
        }).catch((err) =>{
            mongoose.Promise = global.Promise;
            console.log("Erro ao conectar: " + err)
        })

    

//Public
    app.use(express.static(path.join(__dirname, "public"))) //__dirname serve para pegar o caminho absoluto do direotrio evitando erros 
    
    app.use((req, res, next) => {
        console.log("oi eu sou um widdle")
        next()

    })


//rotas
    app.get('/', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})

        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }
            else{
                req.flash("error_msg", "Esta postagem nao existe")
                res.redirect("/")
            }
            
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})

                })
            }else {
                req.flash("error_msg", "Essa categoria nao existe")
                res.redirect(("/"))

            }


        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/404", (res, req) => {
        res.send("Erro 404!")
    })
    app.get('/posts', (req, res) => {
        res.send("Lista de Posts")
    })
        app.use('/admin', urlencodedParse, admin)


    app.use('/admin', admin) 
    app.use("/usuarios", usuarios)



//outros
const PORT = 3000
app.listen(PORT, () => {
    console.log("server rodando")
})
   