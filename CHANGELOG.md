## [2.1.1](https://github.com/open-rpc/generator/compare/2.1.0...2.1.1) (2025-10-22)


### Bug Fixes

* bump stale schema utils version which fixes initial notification parsing ([2ce2264](https://github.com/open-rpc/generator/commit/2ce22649d1e9a64dcda041848159475bb792816c))
* version update typings to support notifications ([2d39399](https://github.com/open-rpc/generator/commit/2d39399818a84cfd1623230393ebb955df1da0f8))

# [2.1.0](https://github.com/open-rpc/generator/compare/2.0.1...2.1.0) (2025-06-27)


### Features

* add support for additional configuration to docs ([a9e64a6](https://github.com/open-rpc/generator/commit/a9e64a603ebd69618ce6cc5a36131199710f4dc9))

## [2.0.1](https://github.com/open-rpc/generator/compare/2.0.0...2.0.1) (2025-06-05)


### Bug Fixes

* documentation rendering bug with gatsby theme ([e9fd09b](https://github.com/open-rpc/generator/commit/e9fd09b37cd7d7e68bfae8d6fc9f538cba8f4631))

# [2.0.0](https://github.com/open-rpc/generator/compare/1.22.3...2.0.0) (2025-03-04)


### Bug Fixes

* 🐛 support gatsby pathPrefix, thus fallback relative ([7ae3278](https://github.com/open-rpc/generator/commit/7ae32788d2d9df3ae7d8cfce9b363e186c6a869c))
* add updated eslinting and lint ([9b80ceb](https://github.com/open-rpc/generator/commit/9b80ceb5680686934fb540b90e5130327d10552e))
* bump ([86c4574](https://github.com/open-rpc/generator/commit/86c4574e98a09d9811383e5bb58b64b95b5ee9c1))
* bump circle ci version ([4f5a65a](https://github.com/open-rpc/generator/commit/4f5a65a12bbf0d6294ca0b602558ea08f5b888b5))
* dont break generated client interface ([46034ca](https://github.com/open-rpc/generator/commit/46034cafe2789470c271a39734a4a1addea2026b))
* tests to align with new esm format ([6548914](https://github.com/open-rpc/generator/commit/6548914fb09d110934cd4785be558cc824d122a9))
* this is how we dooooo ([38d41b1](https://github.com/open-rpc/generator/commit/38d41b19919142e842cbed3321088b542987a4bc))
* update template for gatsby config ([81c6452](https://github.com/open-rpc/generator/commit/81c64525ef179b70b62def9f4a4feb7590d44105))


### Features

* this is a major revision to most packages. The changes support ([7970eaf](https://github.com/open-rpc/generator/commit/7970eafbef683b6432374e45e0bd471401602aa9))


### BREAKING CHANGES

* most apis will be ESM except for server, and use
the latest versions of packages. This will change some of the
logic or processes you may have been using there is also a bump
to schema-utiils for most packages and meta-schema.

## [1.22.3](https://github.com/open-rpc/generator/compare/1.22.2...1.22.3) (2023-01-18)


### Bug Fixes

* bump @open-rpc/typings which will handle leading numbers in titles ([7229170](https://github.com/open-rpc/generator/commit/722917001db071c0ff9dc93b65717cfd0d848cad))
* update deps that were causing tests to fail ([7e55cfc](https://github.com/open-rpc/generator/commit/7e55cfc5ca3b516e7133ec1cdee69ec9b96fc282))
* update node version and add circle ci context ([acd2d73](https://github.com/open-rpc/generator/commit/acd2d73b4bc44e54b34a66ef59148296fc76c6b0))

## [1.22.2](https://github.com/open-rpc/generator/compare/1.22.1...1.22.2) (2021-10-02)


### Bug Fixes

* add package lock file and lock semi ver on a few packages ([1a0d8d7](https://github.com/open-rpc/generator/commit/1a0d8d75e2544eaae43054e4125c7c8a64d3099b))

## [1.22.1](https://github.com/open-rpc/generator/compare/1.22.0...1.22.1) (2021-09-05)


### Bug Fixes

* server component package scripts merge ([3c21c77](https://github.com/open-rpc/generator/commit/3c21c77e3b66f8e8e5db475b4149aa34d05f2eae))

# [1.22.0](https://github.com/open-rpc/generator/compare/1.21.2...1.22.0) (2021-08-27)


### Bug Fixes

* update component in README ([1f708f5](https://github.com/open-rpc/generator/commit/1f708f51770b134cd7e1270150663d8423cadedf))


### Features

* refactor code to support an override output directory ([6e7937e](https://github.com/open-rpc/generator/commit/6e7937e464b52994feb12f98a95cbd8c78e8e2d3)), closes [#655](https://github.com/open-rpc/generator/issues/655)

## [1.21.2](https://github.com/open-rpc/generator/compare/1.21.1...1.21.2) (2021-08-27)


### Bug Fixes

* custom component relative urls ([b28b205](https://github.com/open-rpc/generator/commit/b28b2059935f0232fc31744f31278714194996f9))
* customComponent test paths ([8389a87](https://github.com/open-rpc/generator/commit/8389a87a741957c1565394a0222526c9fcb26a8c))

## [1.21.1](https://github.com/open-rpc/generator/compare/1.21.0...1.21.1) (2021-08-20)


### Bug Fixes

* bump versions of client and lock typings version to latest ([a1645e9](https://github.com/open-rpc/generator/commit/a1645e9df06424ed0d87d1d7489610e06c252238))

# [1.21.0](https://github.com/open-rpc/generator/compare/1.20.1...1.21.0) (2021-08-16)


### Features

* bump typings and lock version ([c356e65](https://github.com/open-rpc/generator/commit/c356e6530034e98a4845e350a97535cc99c617ca))

## [1.20.1](https://github.com/open-rpc/generator/compare/1.20.0...1.20.1) (2021-07-17)


### Bug Fixes

* lodash zipObject wrong order ([5c1a1ef](https://github.com/open-rpc/generator/commit/5c1a1ef2ce651485c8d092cf11b0efab6d8de80a)), closes [#670](https://github.com/open-rpc/generator/issues/670)

# [1.20.0](https://github.com/open-rpc/generator/compare/1.19.1...1.20.0) (2021-06-05)


### Features

* add optional field for custom configs to write openrpc doc to disk ([79f9249](https://github.com/open-rpc/generator/commit/79f92498523774272013e51fd938d71044c4bd57))

## [1.19.1](https://github.com/open-rpc/generator/compare/1.19.0...1.19.1) (2021-06-04)


### Bug Fixes

* lock metaschema version for default client ([fbffc78](https://github.com/open-rpc/generator/commit/fbffc78a59c092174622bafe9641308e4bdd6794))
* type on static path interface can be undefined ([c805051](https://github.com/open-rpc/generator/commit/c8050518c338058079097a3273d289845c70cb64))

# [1.19.0](https://github.com/open-rpc/generator/compare/1.18.13...1.19.0) (2021-06-03)


### Features

* add support for custom generators ([b1b99de](https://github.com/open-rpc/generator/commit/b1b99de8267f53177e913fd4e799620fb99b9893))

## [1.18.13](https://github.com/open-rpc/generator/compare/1.18.12...1.18.13) (2021-06-01)


### Bug Fixes

* package version updates for client and server ([d248e4a](https://github.com/open-rpc/generator/commit/d248e4aee4ce59860560239274a390d620b6bb19))

## [1.18.12](https://github.com/open-rpc/generator/compare/1.18.11...1.18.12) (2021-04-16)


### Bug Fixes

* force types to be methodobjects ([0fe3cd9](https://github.com/open-rpc/generator/commit/0fe3cd9427dc4cf604da9b3ad0a9c0583ea2209a))
* remove extra deps ([ecf6262](https://github.com/open-rpc/generator/commit/ecf62628604cfbea04fdb5fb4b12869a9375d05e))
* typedoc generation fixed ([77f6d24](https://github.com/open-rpc/generator/commit/77f6d24af1bd90eaecf8d1114040664ad4693a3d))
* update inquirer ([e769c12](https://github.com/open-rpc/generator/commit/e769c12dfc23e8725d45acf8e293f199f6ac9f1f))
* update lodash and fs-extra ([cbcab8b](https://github.com/open-rpc/generator/commit/cbcab8b0738e187cdfb204efd7bbeb47c7c445d8))
* update meta schema nd jest dev deps ([c52c18a](https://github.com/open-rpc/generator/commit/c52c18a1cf69ea9c81b28e3874dccdc82b5bb8a1))
* update open-rpc/typings ([c6584ba](https://github.com/open-rpc/generator/commit/c6584ba4f64ed35d1f3e3ec0ad1b546670111143))
* update to lts nodejs and regenerate packagelock ([08a79d7](https://github.com/open-rpc/generator/commit/08a79d766b3785ad3e345eeb637923183690fa48))
* **gatsby docs:** bump docs-react to get syntax-highlighting ([4baf3d3](https://github.com/open-rpc/generator/commit/4baf3d3a9437178ed2285ab0cb83d2ca9db419ca))

## [1.18.11](https://github.com/open-rpc/generator/compare/1.18.10...1.18.11) (2020-12-30)


### Bug Fixes

* update docs-react for better paramStructure by-name support ([264bbd9](https://github.com/open-rpc/generator/commit/264bbd9d210a42ae23ec764d4c62c26830121efc))

## [1.18.10](https://github.com/open-rpc/generator/compare/1.18.9...1.18.10) (2020-12-17)


### Bug Fixes

* update clientjs ([be2eaf9](https://github.com/open-rpc/generator/commit/be2eaf9db4e3c2a65e858fc9de0b0ebdb63cb660))

## [1.18.9](https://github.com/open-rpc/generator/compare/1.18.8...1.18.9) (2020-11-14)


### Bug Fixes

* **docs:** bump inspector version ([cf4c776](https://github.com/open-rpc/generator/commit/cf4c77640bdd9733880f7ae36ef019adcf2cb825))

## [1.18.8](https://github.com/open-rpc/generator/compare/1.18.7...1.18.8) (2020-10-19)


### Bug Fixes

* lock material-ui versions ([4fca162](https://github.com/open-rpc/generator/commit/4fca162f36adb1051f170b131291ef819d2ce340))

## [1.18.7](https://github.com/open-rpc/generator/compare/1.18.6...1.18.7) (2020-10-16)


### Bug Fixes

* **docs:** update to latest inspector ([9253b96](https://github.com/open-rpc/generator/commit/9253b9679d8fe5671dd9bb2f31abc35037b702b2))

## [1.18.6](https://github.com/open-rpc/generator/compare/1.18.5...1.18.6) (2020-09-25)


### Bug Fixes

* bump client js version ([e32a5c5](https://github.com/open-rpc/generator/commit/e32a5c506d67e7dd76b0de5f7511b6f03c54a0a2))

## [1.18.5](https://github.com/open-rpc/generator/compare/1.18.4...1.18.5) (2020-09-02)


### Bug Fixes

* **deps:** lock @types/fs-extra ([2aff98e](https://github.com/open-rpc/generator/commit/2aff98eb28b9ef9825ad57624671958a76e965df))
* **gatsby docs:** lock @open-rpc/inspector version ([181476f](https://github.com/open-rpc/generator/commit/181476f69b277eec49ba15e4630fbf20928d3f1a))

## [1.18.4](https://github.com/open-rpc/generator/compare/1.18.3...1.18.4) (2020-08-05)


### Bug Fixes

* bump bump ([5d169a3](https://github.com/open-rpc/generator/commit/5d169a36c7e1d761f1eb5001ee98322c1b4e6ba7))
* get tests passing again ([a34b635](https://github.com/open-rpc/generator/commit/a34b635505655c378ce1f4e7d4c6c25edf8043bf))
* more deps ([8017b3f](https://github.com/open-rpc/generator/commit/8017b3f3f6aff37b21d4a2e82e42403a9c37308e))
* rebase ([f9e9d45](https://github.com/open-rpc/generator/commit/f9e9d45b5e9c1d38625af7b6182c37684315180c))
* update deps ([50f25da](https://github.com/open-rpc/generator/commit/50f25da246a9372261fdbaab1a33f5607493c627))
* update more deps ([993d16c](https://github.com/open-rpc/generator/commit/993d16cdc0a7ba32a74a85062a07a0b1a545e9dd))
* update more deps ([473b830](https://github.com/open-rpc/generator/commit/473b830782e2f4b0668432105feec6bb970f21c0))
* upgrade deps ([8be5abb](https://github.com/open-rpc/generator/commit/8be5abb8834a1eaa64f8a8bd265dde47cff55e3f))

## [1.18.3](https://github.com/open-rpc/generator/compare/1.18.2...1.18.3) (2020-07-27)


### Bug Fixes

* update client-js interface ([bed242a](https://github.com/open-rpc/generator/commit/bed242a07755ae8b8e546fafed542caaffcc8156))
* **gatsby docs:** add x-transport on servers to default inspector transport ([128a24d](https://github.com/open-rpc/generator/commit/128a24dddda1dd2f30aa6f2b706502ab3eae0a36))

## [1.18.2](https://github.com/open-rpc/generator/compare/1.18.1...1.18.2) (2020-07-21)


### Bug Fixes

* **docs:** default to first server if exists for inspector ([b6b1fe9](https://github.com/open-rpc/generator/commit/b6b1fe9c92b6b9f0e7251fcf758f2cfd3dc2fce7))
* docs build issue with monaco ([5d1fe22](https://github.com/open-rpc/generator/commit/5d1fe22c6d571b02a743ab358bfab4774370e1a1))

## [1.18.1](https://github.com/open-rpc/generator/compare/1.18.0...1.18.1) (2020-07-15)


### Bug Fixes

* **README:** add documentation to list of features ([89a8c10](https://github.com/open-rpc/generator/commit/89a8c10777269be584bf7289323d45023141822c))
* add typedoc configs to clean ui ([c98a93a](https://github.com/open-rpc/generator/commit/c98a93aa39d5d4d36464805b235d846b730587c8))

# [1.18.0](https://github.com/open-rpc/generator/compare/1.17.0...1.18.0) (2020-07-13)


### Bug Fixes

* add docs test ([259e407](https://github.com/open-rpc/generator/commit/259e4079b9625caca973d123442adc5852a18ef8))
* add templates docs dir ([991979b](https://github.com/open-rpc/generator/commit/991979bd848df444ba84bba79318fe5229810f7f))
* remove changelog ([c74fd8d](https://github.com/open-rpc/generator/commit/c74fd8d690632bcca097e7723a9e605d53b44b6e))


### Features

* add docs generator ([4ef3c92](https://github.com/open-rpc/generator/commit/4ef3c92ef7d3532b545b16390bb62a6696fba951))

# [1.17.0](https://github.com/open-rpc/generator/compare/1.16.0...1.17.0) (2020-06-25)


### Features

* update wording ([b655f6b](https://github.com/open-rpc/generator/commit/b655f6b166894cb79d89f05829d031cbdf3cc18e))

# [1.16.0](https://github.com/open-rpc/generator/compare/1.15.5...1.16.0) (2020-06-25)


### Bug Fixes

* remove chat on discord badge & languages ([8ee7870](https://github.com/open-rpc/generator/commit/8ee78703ebea47abeeaf1d09d607a0081006711f))


### Features

* slight improvements to readme ([8c1a55d](https://github.com/open-rpc/generator/commit/8c1a55d95a26afc00b7a6afb12248472fa9fe4d0))
* **typescript:** add postmessage iframe and window support ([9b0eca2](https://github.com/open-rpc/generator/commit/9b0eca2499cb8a9951615b72b3fc31072afbf570))
* add typescript client postmessage support ([e015c34](https://github.com/open-rpc/generator/commit/e015c343e303ca76854bdb44223ca5acd2d650b9))

# [1.16.0](https://github.com/open-rpc/generator/compare/1.15.5...1.16.0) (2020-06-25)


### Features

* slight improvements to readme ([8c1a55d](https://github.com/open-rpc/generator/commit/8c1a55d95a26afc00b7a6afb12248472fa9fe4d0))
* **typescript:** add postmessage iframe and window support ([9b0eca2](https://github.com/open-rpc/generator/commit/9b0eca2499cb8a9951615b72b3fc31072afbf570))
* add typescript client postmessage support ([e015c34](https://github.com/open-rpc/generator/commit/e015c343e303ca76854bdb44223ca5acd2d650b9))

# [1.16.0](https://github.com/open-rpc/generator/compare/1.15.5...1.16.0) (2020-06-25)


### Features

* **typescript:** add postmessage iframe and window support ([9b0eca2](https://github.com/open-rpc/generator/commit/9b0eca2499cb8a9951615b72b3fc31072afbf570))
* add typescript client postmessage support ([e015c34](https://github.com/open-rpc/generator/commit/e015c343e303ca76854bdb44223ca5acd2d650b9))

## [1.15.5](https://github.com/open-rpc/generator/compare/1.15.4...1.15.5) (2020-05-01)


### Bug Fixes

* remove i prefix on server types ([cabbb29](https://github.com/open-rpc/generator/commit/cabbb297b7c3fb1e61d98172b9c885c1562930e3)), closes [#414](https://github.com/open-rpc/generator/issues/414)

## [1.15.4](https://github.com/open-rpc/generator/compare/1.15.3...1.15.4) (2020-03-23)


### Bug Fixes

* **README:** path to config file ([afaa399](https://github.com/open-rpc/generator/commit/afaa399cf4592e4382b91cb4732280b69a1cecd8))

## [1.15.3](https://github.com/open-rpc/generator/compare/1.15.2...1.15.3) (2020-03-04)


### Bug Fixes

* move type packages to non dev deps ([18d2c89](https://github.com/open-rpc/generator/commit/18d2c89c35e727a035458ed5eb99b15a649ef5ed)), closes [#363](https://github.com/open-rpc/generator/issues/363)

## [1.15.2](https://github.com/open-rpc/generator/compare/1.15.1...1.15.2) (2020-02-10)


### Bug Fixes

* update package-lock ([7d7e874](https://github.com/open-rpc/generator/commit/7d7e87475e96e638db0d97f526e8cb42c30c5e52))
* update server dockerfile ([9b53f10](https://github.com/open-rpc/generator/commit/9b53f1087db17910198462e2ce6736074cd22237))

## [1.15.1](https://github.com/open-rpc/generator/compare/1.15.0...1.15.1) (2020-02-10)


### Bug Fixes

* remove rust install ([d7bdf8e](https://github.com/open-rpc/generator/commit/d7bdf8ef8d359c88d234d69ecc741eee2f1ce5de))
* update circle config ([8745990](https://github.com/open-rpc/generator/commit/8745990cd56e5e0466d476d07540a7aaba07e9cc))
* update semantic-release file ([92e650f](https://github.com/open-rpc/generator/commit/92e650f61650f4f8803009b91b4a6b052d59f678))
