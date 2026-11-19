
const express = require('express');
const path = require('path');

const { conectarBanco, pegarBanco } = require('./banco');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Pagina principal
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'Projects.html')
    );
});

// Mostrar todos os posts
app.get('/blog', async (req, res) => {
    try {
        const banco = pegarBanco();

        const posts = await banco
            .collection('posts')
            .find()
            .toArray();

        res.render('blog', { posts });
    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao carregar posts');
    }
});

// Mostrar formulario
app.get('/cadastrar_post', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'cadastrar_post.html')
    );
});

// Cadastrar post
app.post('/salvar_post', async (req, res) => {
    try {
        const { titulo, resumo, conteudo } = req.body;

        if (!titulo || !resumo || !conteudo) {
            return res.status(400).send('Preencha todos os campos');
        }

        const banco = pegarBanco();

        await banco.collection('posts').insertOne({
            titulo,
            resumo,
            conteudo
        });

        res.redirect('/blog');
    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao cadastrar post');
    }
});

// Iniciar servidor somente depois de conectar ao banco
async function iniciar() {
    try {
        await conectarBanco();

        app.listen(80, () => {
            console.log('Servidor rodando na porta 80!');
        });
    } catch (erro) {
        console.error('Erro ao conectar no MongoDB:', erro.message);
        process.exit(1);
    }
}

iniciar();
