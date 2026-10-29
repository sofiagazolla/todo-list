<div align="center">

<img src="./public/favicon.svg" width="82" alt="Ícone do site" />

# To-do <3

</div>

## ✿ sobre o projeto

Esse projeto reúne diversas categorias de checklists, criadas pelo usuário. 

Ele foi desenvolvido porque eu senti a necessidade de uma aplicação do tipo e, mesmo que eu estivesse procurando por algo simples, não encontrei nada que fosse exatamente como eu queria.

Por conta disso, decidi integrar o sistema a um banco de dados, criar a funcionalidade de cadastro e login, e disponibilizá-lo [aqui](https://todo-list-sofi.vercel.app/).

## ☁️ feito com

| Tecnologia | Para quê? |
| :-- | :-- |
| **React** | Componentes e interatividade |
| **Tailwind CSS** | Estilização e responsividade |
| **Supabase** | Autenticação e banco de dados |


## ✧ quer rodar localmente?

Como mencionei, você pode acessar o To-do diretamente pelo [site](https://todo-list-sofi.vercel.app/), sem precisar instalar nada!

Mas, se preferir executar o projeto no seu próprio computador, é só seguir as instruções abaixo.

**1.** Baixe o projeto de uma das seguintes formas:

- **Pelo Git:** clone o repositório e entre na pasta do projeto.

```bash
git clone LINK_DO_REPOSITORIO
cd NOME_DO_REPOSITORIO
```

- **Pelo GitHub:** clique em **Code → Download ZIP**, extraia o arquivo e abra a pasta no terminal.

**2.** Instale as dependências:

```bash
npm install
```

**3.** Crie um projeto no [Supabase](https://supabase.com/) e configure o banco usando o arquivo SQL do repositório:

- No painel do projeto, abra **SQL Editor → New query**.
- Copie o conteúdo do seu arquivo de configuração `schema.sql`, cole no editor e clique em **Run**.
- Confira no **Table Editor** se as tabelas `subjects` e `tasks` foram criadas e se as políticas de segurança (**RLS**) estão configuradas.


**4.** Crie um arquivo `.env.local` na raiz do projeto com as variáveis do seu Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```
> Essas informações podem ser encontradas nas configurações do projeto no Supabase, em **Connect** ou **Settings** -> **API Keys**.

**5.** Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

**6.** Acesse o site indicado no terminal, que geralmente é:
```bash
http://localhost:5173/
```


<div align="center">

**Desenvolvido por \
Sofia Gazolla da Costa Silva ♡**

</div>
