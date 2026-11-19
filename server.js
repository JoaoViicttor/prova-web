
const express = require('express');
const path = require('path');
const { ObjectId } = require('mongodb');

const { conectarBanco, pegarBanco } = require('./banco');

const app = express();

// CONFIGURACOES
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ====================================
// PAGINA PRINCIPAL
// ====================================

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'Projects.html')
    );
});

// ====================================
// BLOG - CREATE E READ
// ====================================

// LISTAR POSTS
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
        res.status(500).send('Erro ao carregar posts. Verifique o MongoDB.');
    }
});

// FORMULARIO DE POST
app.get('/cadastrar_post', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'cadastrar_post.html')
    );
});

// CADASTRAR POST
app.post('/salvar_post', async (req, res) => {
    try {
        const { titulo, resumo, conteudo } = req.body;

        if (!titulo?.trim() || !resumo?.trim() || !conteudo?.trim()) {
            return res.status(400).send('Preencha todos os campos');
        }

        const banco = pegarBanco();

        await banco.collection('posts').insertOne({
            titulo: titulo.trim(),
            resumo: resumo.trim(),
            conteudo: conteudo.trim()
        });

        res.redirect('/blog');

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao cadastrar post. Verifique o MongoDB.');
    }
});

// ====================================
// CARROS - CRUD COMPLETO
// ====================================

// LISTAR CARROS
app.get('/carros', async (req, res) => {
    try {
        const banco = pegarBanco();

        const carros = await banco
            .collection('Carros')
            .find()
            .toArray();

        res.render('carros', { carros });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao listar carros. Verifique o MongoDB.');
    }
});

// FORMULARIO DE CADASTRO
app.get('/cadastrar_carro', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'cadastrar_carro.html')
    );
});

// CADASTRAR CARRO
app.post('/salvar_carro', async (req, res) => {
    try {
        const { marca, modelo, ano, quantidade } = req.body;

        const anoNumero = Number(ano);
        const quantidadeNumero = Number(quantidade);

        if (
            !marca?.trim() ||
            !modelo?.trim() ||
            !Number.isInteger(anoNumero) ||
            !Number.isInteger(quantidadeNumero) ||
            anoNumero < 1886 ||
            anoNumero > 2100 ||
            quantidadeNumero < 0
        ) {
            return res.status(400).send('Dados invalidos');
        }

        const banco = pegarBanco();

        await banco.collection('Carros').insertOne({
            marca: marca.trim(),
            modelo: modelo.trim(),
            ano: anoNumero,
            quantidade: quantidadeNumero
        });

        res.redirect('/carros');

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao cadastrar carro');
    }
});

// ABRIR EDICAO
app.get('/editar_carro/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID invalido');
        }

        const banco = pegarBanco();

        const carro = await banco
            .collection('Carros')
            .findOne({
                _id: new ObjectId(req.params.id)
            });

        if (!carro) {
            return res.status(404).send('Carro nao encontrado');
        }

        res.render('editar_carro', { carro });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao abrir edicao');
    }
});

// ATUALIZAR CARRO
app.post('/atualizar_carro/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID invalido');
        }

        const { marca, modelo, ano, quantidade } = req.body;

        const anoNumero = Number(ano);
        const quantidadeNumero = Number(quantidade);

        if (
            !marca?.trim() ||
            !modelo?.trim() ||
            !Number.isInteger(anoNumero) ||
            !Number.isInteger(quantidadeNumero) ||
            anoNumero < 1886 ||
            anoNumero > 2100 ||
            quantidadeNumero < 0
        ) {
            return res.status(400).send('Dados invalidos');
        }

        const banco = pegarBanco();

        const resultado = await banco
            .collection('Carros')
            .updateOne(
                { _id: new ObjectId(req.params.id) },
                {
                    $set: {
                        marca: marca.trim(),
                        modelo: modelo.trim(),
                        ano: anoNumero,
                        quantidade: quantidadeNumero
                    }
                }
            );

        if (resultado.matchedCount === 0) {
            return res.status(404).send('Carro nao encontrado');
        }

        res.redirect('/carros');

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao atualizar carro');
    }
});

// EXCLUIR CARRO
app.post('/excluir_carro/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID invalido');
        }

        const banco = pegarBanco();

        await banco.collection('Carros').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        res.redirect('/carros');

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao excluir carro');
    }
});

// VENDER CARRO
app.post('/vender_carro/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID invalido');
        }

        const banco = pegarBanco();

        await banco.collection('Carros').updateOne(
            {
                _id: new ObjectId(req.params.id),
                quantidade: { $gt: 0 }
            },
            {
                $inc: { quantidade: -1 }
            }
        );

        res.redirect('/carros');

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao vender carro');
    }
});

// ====================================
// INICIAR SERVIDOR
// ====================================

async function iniciar() {

    // O servidor inicia mesmo sem MongoDB
    app.listen(80, () => {
        console.log('SERVIDOR FUNCIONANDO!');
        console.log('Acesse: http://localhost');
    });

    // Tenta conectar ao banco
    try {
        await conectarBanco();
        console.log('Banco de dados pronto!');

    } catch (erro) {
        console.log('MongoDB indisponivel.');
        console.log('O servidor continua funcionando!');
    }
}

iniciar();
