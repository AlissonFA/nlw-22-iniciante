<h1 align="center"> ✂️ ClipMaker | Extraia momentos virais com IA em segundos </h1>

<p align="center">
  <a href="#-o-projeto">O Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-visualização">Visualização</a>
</p>

<p align="center">
  <img alt="Preview do Projeto" src="./assets/images/Preview.png" width="100%">
</p>

## 💻 O Projeto

O **ClipMaker** é uma aplicação web que utiliza Inteligência Artificial para analisar vídeos e extrair automaticamente os trechos mais virais. O usuário faz o upload do vídeo via Cloudinary, a transcrição do áudio é gerada automaticamente, e o Gemini AI analisa o conteúdo para identificar o segmento mais envolvente entre 30 e 60 segundos — devolvendo um clipe pronto para compartilhar, renderizado diretamente no servidor, sem nenhum download intermediário.

Os principais destaques do desenvolvimento incluem:

1. **Pipeline de IA assíncrona com retry automático:** A aplicação implementa uma lógica de espera ativa (`waitForTranscription`) que verifica até 30 vezes, em intervalos de 2 segundos, se a transcrição gerada pelo Cloudinary já está disponível. Após confirmada, envia o contexto completo ao Gemini AI com até 3 tentativas automáticas (`getViralMomentWithRetry`), tornando o sistema resiliente a falhas transitórias de rede ou de processamento.

2. **Transformação de vídeo server-side via URL do Cloudinary:** O timestamp retornado pelo Gemini (`so_<start>,eo_<end>`) é injetado diretamente na URL de transformação do Cloudinary (`/video/upload/so_X,eo_Y/public_id.mp4`), fazendo com que o corte do vídeo aconteça no servidor — sem necessidade de bibliotecas de edição no cliente, sem download do arquivo original, entregando o clipe via CDN com latência mínima.

3. **Arquitetura de arquivos modular (Separation of Concerns):** O projeto foi refatorado de um único `index.html` monolítico para uma estrutura organizada por responsabilidade, separando estilos por contexto (`global.css`, `utility.css`, `animations.css`, `hero.css`, `features.css`) e scripts por domínio (`app.js` para lógica de negócio, `animations.js` para GSAP). **A interface visual foi desenvolvida com auxílio de IA de forma intencional** — o foco do aprendizado estava na lógica de integração entre Cloudinary e Gemini AI, que foi escrita à mão desde o protótipo inicial e mantida com adaptações de estrutura na versão final.

## 🚀 Tecnologias

Este projeto foi construído utilizando as seguintes ferramentas e conceitos:

* **HTML5 Semântico:** Estrutura base da aplicação, com marcação acessível e organizada por seções (`<nav>`, `<section>`, `<footer>`). O `index.html` atua exclusivamente como esqueleto, importando CSS e JS externos.
* **Tailwind CSS (via CDN):** Utilizado para toda a estilização utilitária, com configuração customizada de cores (`brand`) e fontes (`display`, `body`) via `tailwind.config`. Responsividade `fluid` do iPhone SE ao monitor 4K.
* **CSS Modular Customizado:** Dividido em cinco arquivos com responsabilidades distintas — `global.css` (reset e background), `utility.css` (glass, glow, inputs), `animations.css` (todos os `@keyframes`), `hero.css` (gradientes de texto) e `features.css` (hover dos cards e steps) todos importados via `@import` em um único arquivo de entrada index.css, que é o único referenciado pelo HTML. Isso elimina múltiplos `<link>` no `index.html` e centraliza a ordem de carregamento dos estilos em um só lugar.
* **Google Fonts (Syne + DM Sans):** Dupla tipográfica que combina um display font geométrico e expressivo (Syne) com uma fonte de corpo moderna e legível (DM Sans), garantindo hierarquia visual e identidade forte.
* **Lucide Icons (via CDN):** Biblioteca de ícones SVG utilizada para todos os elementos visuais de interface, com reinicialização dinâmica (`lucide.createIcons()`) para ícones injetados via JavaScript.
* **GSAP + ScrollTrigger (`animations.js`):** Orquestração das animações de entrada do hero (timeline encadeada) e revelações progressivas por scroll das seções de features, steps e app card, com efeitos de `stagger`, `back.out` e animação infinita nas barras de forma de onda.
* **Cloudinary Upload Widget + MediaFlows:** SDK de upload para envio direto do vídeo para a nuvem. A transcrição automática é gerada via **PowerFlow** no MediaFlows — utilizando o template **Export Video Transcription**, que detecta o upload de um vídeo e aciona automaticamente a geração e salvamento da transcrição.
* **Gemini AI (Google Generative Language API):** Modelo `gemini-3-flash` chamado diretamente do browser via `fetch` na API REST, recebendo a transcrição completa do vídeo e retornando apenas o par de timestamps (`so_X,eo_Y`) para o corte viral.
* **Vanilla JavaScript (`app.js`):** Toda a lógica de aplicação foi implementada sem frameworks — gerenciamento de estado via objeto `app`, controle de UI com helpers (`setStatus`, `setError`, `showResult`), tratamento de erros assíncrono com `try/catch` e lógica de retry com loops `async/await`.
* **Git & GitHub:** Versionamento e deploy da aplicação.

## 🔑 Configurando suas credenciais

O projeto não possui nenhuma chave ou credencial hardcoded — tudo é inserido diretamente na interface e salvo apenas no `localStorage` do seu navegador.

Você precisará de **três credenciais** para utilizar a aplicação:

---

### ☁️ 1. Cloudinary — Cloud Name, Upload Preset e MediaFlow

#### 1.1 Criar conta e obter o Cloud Name

1. Crie uma conta gratuita em [cloudinary.com](https://cloudinary.com)
2. Seu **Cloud Name** aparece no Dashboard logo após o login

#### 1.2 Criar o Upload Preset

1. Vá em **Settings → Upload → Upload presets**
2. Clique em **Add upload preset**
3. Em **Signing Mode**, selecione **Unsigned**
4. Salve e copie o nome do preset criado

#### 1.3 Configurar o MediaFlow para transcrição automática

O ClipMaker depende de um **PowerFlow** no Cloudinary MediaFlows para transcrever o áudio dos vídeos automaticamente após cada upload. O Cloudinary oferece um template pronto que já cria a estrutura base do fluxo:

**Criando o fluxo a partir do template:**

1. No painel do Cloudinary, acesse **MediaFlows** no menu lateral
2. Clique em **Templates**
3. Na aba **Video Management**, selecione o template **"Export video transcription"**
4. Na tela de configuração do template, escolha o trigger **On Asset Upload**
5. Confirme — o fluxo será criado automaticamente com 2 nós:

```
[ On Asset Upload ] ──→ [ Generate and Save Transcript ]
```

**Adicionando a condição entre os nós:**

O template não filtra por tipo de arquivo por padrão. Para garantir que a transcrição só rode em vídeos (e não em imagens ou outros uploads), adicione uma condição entre os dois nós:

1. Clique no conector entre os dois nós e adicione um nó do tipo **Condition**
2. Configure a condição com os seguintes valores:

| Campo | Valor |
|---|---|
| First variable | `On Asset Upload Resource type` |
| Operator | `equal_to` |
| Second variable | `video` |
| Variable type | `String` |

O fluxo final ficará assim:

```
[ On Asset Upload ] ──→ [ Se vídeo (Condição) ] ──→ [ Generate and Save Transcript ]
```

**Configurando cada nó:**

**Nó 1 — On Asset Upload:**

> ⚠️ **Atenção:** verifique se o campo **Asset type** está definido como **`All asset types`**. Caso venha pré-selecionado como `video`, a condição do nó seguinte nunca será acionada corretamente. Deixe como `All asset types` e delegue o filtro por tipo à condição.

| Campo | Valor |
|---|---|
| Trigger for any asset | desmarcado |
| Asset type | `All asset types` |

**Nó 2 — Condição "Se vídeo":** preencha conforme a tabela acima.

**Nó 3 — Generate and Save Transcript:**

| Campo | Valor |
|---|---|
| Use the asset from | `On Asset Upload` |
| Custom | desmarcado |
| Postfix | `transcript_` |
| Relate transcription to video | `Yes` |

Após configurar os 3 nós, clique em **Save** e depois em **Activate** para ativar o fluxo. A partir de agora, todo vídeo enviado para sua conta via Upload Widget terá a transcrição gerada automaticamente.

---

### 🤖 2. Google Gemini — Chave de API

1. Acesse [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Clique em **Create API key**
3. Copie a chave gerada (começa com `AIzaSy...`)

---

> ⚠️ **Segurança:** Nenhuma dessas credenciais é enviada para servidores externos. O Cloud Name e o Upload Preset são usados diretamente com a API pública do Cloudinary; a chave do Gemini é enviada exclusivamente para a API do Google. Tudo processado no seu próprio navegador.

## 👀 Visualização

Você pode visualizar e interagir com o projeto através dos links abaixo:

* 📲 **[Acesse a abertura da NLW](https://www.youtube.com/live/4DsGnkMJ12Y?si=g7-BGOPMQvCjn_VF)**
* 👉 **[Acesse o site funcionando aqui](https://alissonfa.github.io/nlw-22-iniciante/)**

**Para rodar no seu computador (Local):**

1. Faça o download ou clone o repositório.
2. Certifique-se de que a estrutura de pastas está correta:
```
clipmaker/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   ├── index.css
    │   ├── global.css
    │   ├── utility.css
    │   ├── hero.css
    │   ├── features.css
    │   └── animations.css
    ├── images/
    │   └── Preview.png
    └── js/
        ├── app.js
        └── animations.js
```

3. Dê um duplo clique no arquivo `index.html` ou abra através da extensão *Live Server* no seu editor de código.
4. Na seção **"Experimente"**, preencha os campos **Cloud Name**, **Upload Preset** e **Chave de API do Gemini** antes de fazer o upload. As credenciais são salvas automaticamente no navegador para uso futuro.

---

Feito com 💜 por **[AlissonFA](https://www.linkedin.com/in/alissonfa/)**