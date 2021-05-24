# setting

- primsa setting

```
//dotenv file
PORT=
DATABASE_URL=mysql://USER:PASSWORD@127.0.0.1:3306/DB_NAME?connection_limit=5
JWT_SECRET=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

```
npx prisma migrate dev --name init --preview-feature
npx prisma generate
npm run dev
```

### graphql 가이드

- 아래 링크에서 graphql client를 다운해주세요. (크롬, 맥, 리눅스 등 편하신 걸로)
  https://altair.sirmuel.design/#download

![guide](https://github.com/codestates/Sol-git/blob/main/server/guideimg/guide1.png)

실행 시키시면 위와 같은 프로그램이 실행 될 거에요.

1. (1)에 해당하는 곳에 서버의 URL을 적어주세요.

2. (2) Send Request 버튼을 누르면 서버와 연결 될 거에요.

3. (3) Docs를 누르면 (4)번 위치에서 Query와 Mutation에 대한 문서를 볼 수 있어요.

4. 문서 안에 있는 (5) ADD QUERY를 누르면 (6)에 쿼리가 입력되요. 직접 입력할 수도 있어요.

5. (2) Send Request를 클릭하거나 Cmd + Enter를 누르면 (7)에 쿼리의 결과가 나올 거에요.

6. Query는 RestfulAPI에 GET에 해당되요. 데이터 Fetch는 Query 명령으로 하시면 되요.

7. Mutation은 RestfulAPI에 POST, PUT, DELETE에 해당한다고 생각하시면되요. 데이터의 업데이트, 삭제 등에 사용되고 필요시 데이터도 fetch 할 수 있어요.

![guide2](https://github.com/codestates/Sol-git/blob/main/server/guideimg/guilde2.png)

query 뒤에오는 test는 쿼리함수의 이름입니다. 없어도 상관없지만 어떤 기능을 하는 쿼리인지 적어놓는게 나중에 디버깅 하기도 쉽습니다.

graphql은 restful api와 다르게 한번의 쿼리로 여러개의 요청을 날릴 수 있습니다.

쿼리 안에 있는 hello와 tag는 서로 다른 요청이지만 하나의 쿼리 안에서 요청을 보낼 수 있습니다.
