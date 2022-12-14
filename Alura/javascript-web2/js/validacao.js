export function valida(input) {
    const tipoDeInput = input.dataset.tipo;

    if (validadores[tipoDeInput]) {
        validadores[tipoDeInput](input);
    }

    if (input.validity.valid) {
        input.parentElement.classList.remove("input-container--invalido");
        input.parentElement.querySelector(".input-mensagem-erro").innerHTML = "";
    } else {
        input.parentElement.classList.add("input-container--invalido");
        input.parentElement.querySelector(".input-mensagem-erro").innerHTML = mostraMensagemErro(tipoDeInput, input);
    }
}

const tiposDeErro = ["valueMissing", "typeMismatch", "patternMismatch", "customError"];

const mensagemDeErro = {
    nome: {
        valueMissing: "Este campo deve ser preenchido.",
    },
    email: {
        valueMissing: "Este campo deve ser preenchido.",
        typeMismatch: "O email digitado deve ser válido.",
    },
    senha: {
        valueMissing: "Este campo deve ser preenchido.",
        patternMismatch: "A senha deve conter entre 6 e 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter síbolos.",
    },
    dataNascimento: {
        valueMissing: "Este campo deve ser preenchido.",
        customError: "Você deve ser maior que 18 anos para se cadastrar.",
    },
    cpf: {
        valueMissing: "Este campo deve ser preenchido.",
        customError: "O CPF digitado não é válido.",
    },
    cep: {
        valueMissing: "Este campo deve ser preenchido",
        patternMismatch: "O CEP digitado não é válido.",
        customError: "Não foi possível encontrar o CEP.",
    },
    logradouro: {
        valueMissing: "Este campo deve ser preenchido",
    },
    cidade: {
        valueMissing: "Este campo deve ser preenchido",
    },
    estado: {
        valueMissing: "Este campo deve ser preenchido",
    },
    preco: {
        valueMissing: "Este campo deve ser preenchido",
    }
};

const validadores = {
    dataNascimento: (input) => validaDataNascimento(input),
    cpf: (input) => validaCpf(input),
    cep: (input) => recuperarCep(input),
};

function mostraMensagemErro(tipoDeInput, input) {
    let mensagem = "";

    tiposDeErro.forEach((erro) => {
        if (input.validity[erro]) {
            mensagem = mensagemDeErro[tipoDeInput][erro];
        }
    });

    return mensagem;
}

function validaDataNascimento(input) {
    const dataRecebida = new Date(input.value);
    let mensagem = "";

    if (!maior18Anos(dataRecebida)) {
        mensagem = "Você deve ser maior que 18 anos para se cadastrar";
    }

    input.setCustomValidity(mensagem);
}

function maior18Anos(data) {
    const dataAtual = new Date();
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDay());

    return dataMais18 <= dataAtual;
}

function validaCpf(input) {
    const formataCpf = input.value.replace(/\D/g, "");
    let mensagem = "";

    if (!checaCpfRepetido(formataCpf) || !checaEstruturaCPF(formataCpf)) {
        mensagem = "O CPF digitado nao é valido";
    }

    input.setCustomValidity(mensagem);
}

function checaCpfRepetido(cpf) {
    const valoresRepetidos = ["00000000000", "11111111111", "22222222222", "33333333333", "44444444444", "55555555555", "66666666666", "77777777777", "88888888888", "99999999999"];

    let cpfValidado = true;

    valoresRepetidos.forEach((valorRepetido) => {
        if (valorRepetido == cpf) {
            cpfValidado = false;
        }
    });

    return cpfValidado;
}

function checaEstruturaCPF(cpf) {
    const multiplicador = 10;

    return checaDigitoVerificador(cpf, multiplicador);
}

function checaDigitoVerificador(cpf, multiplicador) {
    if (multiplicador >= 12) {
        return true;
    }

    let multiplicadorInicial = multiplicador;
    let soma = 0;
    const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split("");
    const digitoVerificador = cpf.charAt(multiplicador - 1);
    for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
        soma = soma + cpfSemDigitos[contador] * multiplicadorInicial;
        contador++;
    }

    if (digitoVerificador == confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf, multiplicador + 1);
    }

    return false;
}

function confirmaDigito(soma) {
    return 11 - (soma % 11);
}

function recuperarCep(input) {
    const cep = input.value.replace(/\D/g, "");
    const url = `https://viacep.com.br/ws/${cep}/json`;
    const options = {
        method: "GET",
        mode: "cors",
        headers: {
            "content-type": "application/json;charset = utf-8",
        },
    };

    if (!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url, options)
            .then((response) => response.json())
            .then((data) => {
                if (data.erro) {
                    input.setCustomValidity("Não foi possível encontrar o CEP.");
                    return
                }
                input.setCustomValidity("");
                preencheEndereco(data);
                return
            });
    }
}

function preencheEndereco(data){
    const logradouro = document.querySelector('[data-tipo="logradouro"]');
    const cidade = document.querySelector('[data-tipo="cidade"]');
    const estado = document.querySelector('[data-tipo="estado"]');

    logradouro.value = data.logradouro;
    cidade.value = data.localidade;
    estado.value = data.uf;
}
