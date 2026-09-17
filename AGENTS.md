# Combinado de trabalho — cocreator-ml

O módulo de aprendizado de máquina.

> **Este bloco é ESPELHADO nos cinco repositórios do Cocreator.** Ele é igual em
> todos, de propósito — o agente lê só o arquivo do repositório em que está
> trabalhando. Ao mudar aqui, mude nos outros: `cocreator-core`,
> `cocreator-canvas`, `cocreator-social`, `cocreator-video`, `cocreator-ml`.
> Duas cópias que discordam já custaram caro neste projeto.

## 1. Como os dois times se falam

Este projeto é trabalhado por **dois times**, cada um com o seu agente:
**André + Codex** e **Sidnei + Claude**. Os dois têm acesso a todos os
repositórios.

**O canal é o GitHub.** Os agentes **não conseguem conversar direto**, e isso foi
medido: o canal entre as sessões do Claude vive num diretório do usuário `sid`
com permissão `700`, invisível para o usuário `andre` — abrir isso seria
afrouxar uma fronteira do sistema operacional por conveniência. E mesmo que
enxergasse, Codex e Claude não falam o mesmo protocolo.

- **Antes de entrar numa área que não é o seu foco, abra uma issue.** Três linhas
  bastam: o que vai mexer, em quais arquivos, e por quê.
- **A PR é o entregável e é a conversa.**
- Nenhum dos dois agentes fica rodando. Mensagem escrita agora é lida quando a
  pessoa do outro lado abrir uma sessão — o GitHub é o que a faz sobreviver.

Para recado rápido na mesma máquina existe `scripts/recado` (no repositório
`cocreator-social`). É bilhete na geladeira, não chat, e **nunca leva segredo**.

## 2. Quem mexe onde, e onde fica o controle

**Acesso não é o portão. O portão é o deploy.** Subir exige o Google Cloud, e
medido: a conta do projeto tem **uma única pessoa** com permissão. Nenhum
commit, merge ou branch chega ao ar sem passar pelo Sidnei.

**O que NÃO existe é proteção de branch** — o GitHub não permite proteger a
`main` em repositório privado sem plano pago. Tecnicamente, quem tem `write`
empurra direto na `main`.

Por isso a regra abaixo não é burocracia: **a `main` limpa depende inteiramente
de disciplina.** E o estrago não aparece em produção — aparece na próxima pessoa
que cortar uma branch de uma `main` com trabalho que ninguém revisou. Isso já
reverteu trabalho **cinco vezes** aqui.

**Focos** (combinado, não permissão): social é do André; canvas e core são do
Sidnei. Mexer fora do seu foco é permitido — só avise antes.

## 3. Processo — não negociável

- **Nunca commitar nem empurrar direto na `main`.** Branch e pull request, sempre.
- **Partir da `main` de agora:** `git fetch origin && git checkout main && git pull`
  antes de criar a branch.
- **Conferir o diff final contra a intenção declarada** antes de abrir a PR.
- **Alteração de banco (DDL) não se roda.** Escreva o script, explique, e passe
  ao Sidnei — vale para coluna, tabela, índice e função.
- **Segredo vem do ambiente.** Nunca no código, nunca em `ARG` de Dockerfile,
  nunca em log. A chave do Supabase já foi parar no pacote do navegador assim.
- **Tocar só no escopo da tarefa.**

## 4. Sinal de sucesso que ninguém verificou é pior que falha

É o padrão que mais apareceu neste projeto. Rotas devolviam `success: true` sem
ler a resposta da API externa — inclusive sem token. Uma rota de upload devolveu
200 gravando numa tabela que **não existia**.

**Quem afirma sucesso precisa ter conferido o efeito.** Ler o status e o corpo,
conferir que a linha entrou, buscar a URL que acabou de montar. Se não dá para
conferir barato, o retorno diz que não conferiu — nunca `success: true`.

**`supabase-js` devolve `{ error }` em vez de lançar.** Um `try/catch` em volta
não captura nada. Sempre cheque o `error` do retorno.

**As leituras são mais silenciosas que as escritas.** Coluna inexistente numa
escrita costuma estourar; numa leitura devolve `undefined` e cai num fallback.

## 5. Meça a premissa antes da conclusão, com controle negativo

Um marcador positivo sozinho não prova nada. Ao afirmar que algo existe, quebrou
ou vazou, **rode o caso que deveria dar o resultado OPOSTO**. Se os dois derem
igual, você não mediu nada.

Dois exemplos medidos aqui: sob `/api`, rota existente e inexistente devolvem
**401 idêntico** sem cookie — um 401 não prova que a rota existe. E `next dev`
com o bypass de autenticação ligado roda como **administrador**, então teste de
"usuário comum não pode mexer no dado de outro" feito assim mede o caminho
errado **com sucesso**.

**Comentário é hipótese a testar, não fato.** Dois casos no mesmo dia em que o
comentário mentia — e os dois justamente sobre segurança.

## 6. Ao relatar

- Diga o que **mediu**, não o que deduziu. Cole o número, o status, a saída.
- Se não conseguiu verificar, diga isso — não preencha a lacuna com plausível.
- Bug descrito num documento é **relato datado**, não estado do código.
- Corrigir a si mesmo é barato; insistir num achado errado é caro.

---

## 7. Sobre este repositório

**Ele está parado.** Não recebe mudança há meses e não está no caminho de
nenhum app em produção hoje. Antes de mexer, confirme com o Sidnei que ele ainda
é o lugar certo — pode ser que a função tenha migrado para outro repositório.

O bloco acima vale mesmo assim: é o combinado entre os times, e ele não depende
de qual repositório está aberto.
