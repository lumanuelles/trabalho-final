// Redesign do login.js para seguir o exemplo do curl fornecido
const API_URL = 'https://api-nr.vercel.app/api/auth/login';

// Redireciona se já estiver autenticado
const token = localStorage.getItem('token');
if (token) {
    window.location.href = '../admin';
}

function showMessage(message, isError = false) {
    const msg = document.getElementById('msg');
    msg.textContent = message;
    msg.style.display = 'block';
    msg.style.color = isError ? '#ff4444' : '#44ff44';
    msg.style.marginTop = '10px';
    msg.style.textAlign = 'center';
}

function hideMessage() {
    const msg = document.getElementById('msg');
    msg.style.display = 'none';
    msg.textContent = '';
}

document.getElementById('bt-entrar').addEventListener('click', async (e) => {
    e.preventDefault();
    hideMessage();

    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    
    // Validação básica
    if (!usuario || !senha) {
        showMessage('Preencha todos os campos', true);
        return;
    }
    
    if (usuario.length < 3 || usuario.length > 50) {
        showMessage('Username deve ter entre 3 e 50 caracteres', true);
        return;
    }
    
    const btn = document.getElementById('bt-entrar');
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        // O backend espera "username" e "senha"
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usuario,  // Campo correto: "username"
                senha: senha        // Campo correto: "senha"
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Salva o token e o tipo de usuário
            localStorage.setItem('token', data.token);
            if (data.userType) {
                localStorage.setItem('userType', data.userType);
            }
            
            showMessage('Login realizado com sucesso! Redirecionando...');
            setTimeout(() => {
                window.location.href = '../admin';
            }, 1000);
        } else {
            // Trata erros de validação ou autenticação
            let errorMessage = 'Username ou senha incorretos';
            
            if (data.errors && Array.isArray(data.errors)) {
                // Erros de validação do express-validator
                errorMessage = data.errors.map(err => err.msg).join(', ');
            } else if (data.error) {
                // Erro de autenticação
                errorMessage = data.error;
            }
            
            showMessage(errorMessage, true);
            btn.disabled = false;
            btn.textContent = 'Entrar';
        }
    } catch (err) {
        console.error('Erro no login:', err);
        showMessage('Erro ao conectar com o servidor. Tente novamente.', true);
        btn.disabled = false;
        btn.textContent = 'Entrar';
    }
});