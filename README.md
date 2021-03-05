<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## EP.1 유저 회원가입 수정

오늘은 유저 회원가입 부분을 수정했다. 일단 transaction을 적용했고 유저 role이 owner인 경우 레스토랑도 바로 생성 될 수 있게 작업을 했다.
원래라면 더 복잡하게 진행을 하겠지만 나는 하나의 프로젝트로 모든 기능을 생성 할 예정이기 때문에 심플하게 가기도 했다.

### 오늘 한 일

- 유저 회원가입
- 레스토랑 생성

## EP.2 유저 로그인 / 이메일 인증 / 유저 정보 가져오기

오늘은 유저 관련 API를 전반적으로 수정했다. 다음에는 유저 API 및 레스토랑 등록 페이지 작업 할 것 같다.

### 오늘 한 일

- 유저 로그인
- 이메일 인증
- 유저 정보 가져오기

## EP.3 카테고리 API

오늘은 카테고리에 대한 API를 전반적으로 수정했다. 기존에는 단순히 유저가 사용하는 클라이언트를 기준으로 작업을 했다면 현재는
레스토랑 어드민에 대한 생각을 가지고 만들기 때문에 전반적인 수정이 필요했다. 그리고 다음부터는 레스토랑 작업을 시작 할 건데...
메뉴를 대대적으로 변경해야겠다. 배민을 참고로 db 모델을 개발 할 건데 배인은 일단 커스텀하게 만드는 세트라는 개념이 있다.

그리고 그 세트에는 대표메뉴라는 개념도 존재한다.

- 메뉴

  - name 이름
  - price 가격
  - description 설명
  - photo 사진

- 카테고리 메뉴 - 여로 메뉴에 폼함 될 수 있음

  - main 대표메뉴
  - name 세트 메뉴 이름
  - menus 메뉴 정보

  - 대표 메뉴 (카테고리 개념)

  - 커스텀 메뉴 (카테고리 개념)

- 사이드 메뉴

  - 사이드 음식 (토핑, 음료)

- 커스텀 메뉴
  - 매운맛, 사이즈
