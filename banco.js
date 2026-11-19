
const { MongoClient } = require('mongodb');

const endereco = process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017';

const cliente = new MongoClient(endereco);

let banco;

async function conectarBanco() {
    await cliente.connect();

    banco = cliente.db('prova_web');

    console.log('MongoDB conectado!');
}

function pegarBanco() {
    if (!banco) {
        throw new Error('Banco de dados nao conectado');
    }

    return banco;
}

module.exports = {
    conectarBanco,
    pegarBanco
};
