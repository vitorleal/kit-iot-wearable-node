# Kit IoT Wearable Telefonica VIVO - Bluetooth 2
[![NPM](https://nodei.co/npm/kit-iot-wearable-bluetooth2.png?downloads=true)](https://nodei.co/npm/kit-iot-wearable-bluetooth2/)

Módulo de [NodeJS](http://nodejs.org/) para conectar via bluetooth com o [Kit de Desenvolvimento IoT Wearable](http://iot.telefonicabeta.com/).

O kit possui os seguintes sensores:
  * Módulo Bluetooth - ([HM-13](http://www.fasttech.com/product/1827700-hm-13-dual-mode-bluetooth-4-0-ble-spp-le-serial))
  * Luminosidade
  * Temperatura
  * Acelerômetro
    * eixo x
    * eixo y
    * eixo z
  * LED RGB
  * Buzzer


## Como utilizar
Para utilizar o módulo instale ele utilizando o [npm](https://www.npmjs.com/)

```
$ npm install kit-iot-wearable-bluetooth2
```

### Dependência de sistema operacional

##### Mac
  * Install [Xcode](https://itunes.apple.com/ca/app/xcode/id497799835?mt=12)

##### Linux (Ubuntu)
  * Kernel version 3.6 or above
  * ```sudo apt-get install bluetooth bluez-utils libbluetooth-dev```
  * Rodar como ```sudo```


#### Exemplo de utilização
```js
var Wearable = require('kit-iot-wearable-bluetooth2'),
    kit = new Wearable({
      name: 'name-of-your-wearable'
    });

kit.findWearable();

//after connect the 'connected' event will be emitted
kit.on('connected', function () {
  kit.ledON('RED');
  kit.playMusic();
});
```

Para mais exemplos veja a [documentação](DOCS.md)


## Documentação para utilização
Veja a documentação do módulo node - [link](DOCS.md)

###Documentação do Módulo bluetooth HM-13
Veja a documentação do módulo bluetooth HM-13 - [link](http://www.seeedstudio.com/wiki/images/3/32/Bluetooth_HM-13_en.pdf)


## Lista de comandos do Wearable
Veja a lista de comandos [aqui](https://github.com/telefonicadigital/kit-iot-wearable-node/wiki/Comandos-padr%C3%B5es-do-Wearable)

## Autor
| [![twitter/vitorleal](http://gravatar.com/avatar/e133221d7fbc0dee159dca127d2f6f00?s=80)](http://twitter.com/vitorleal "Follow @vitorleal on Twitter") |
|---|
| [Vitor Leal](http://vitorleal.com) |
