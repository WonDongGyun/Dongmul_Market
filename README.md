# 😼 동물마켓  
[**[우리 동네 물물교환 마켓! 동물마켓의 백엔드 리포지토리에 오신 여러분을 환영합니다!]**](https://tristy.tistory.com/)  

**우리 동네 물물교환 마켓! 동물마켓!**

돈 없는 사람들도 중고 거래 하고 필요한 물품을 구할 수는 없을까?  
그런 당신을 동물 마켓이 도와드리겠습니다!  

<br/>
<br/>

[**[Fornt-End Github]**](https://github.com/hyemigwak/randomlunch)  
[**[Demo Video]**](https://www.youtube.com/watch?v=dYHfr0oWtcs&feature=youtu.be)  

<p align="center"><img src="https://user-images.githubusercontent.com/52685665/119868462-05c9b880-bf5a-11eb-9619-c6697f060f7c.jpg" width=50% ></p>
<p align="center"><img src="https://user-images.githubusercontent.com/52685665/119868640-4295af80-bf5a-11eb-8f09-f25d272a63b9.jpg" width=50% ></p>


<br/>
<br/>

🤔 Team
-------------  
[Front-End] [곽혜미](https://github.com/hyemigwak), [이지은](https://github.com/Jinnycorn)  
[Back-End] 원동균, [이재윤](https://github.com/Leejaeyoon94)  

<br/>
<br/>


🤔 프로젝트 개요
-------------  
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>진행 날짜 - 2021.04.23 ~ 2021.05.28 </b></li>
<li><b>목적 - 팀원들과 함께, 백엔드와 프론트 엔드의 역할을 맡아 주제를 선정하고 프로젝트를 진행하자</b></li>
<li><b>필수 포함 사항</b></li>
</ul>

<br/>
<br/>

<p align="center"><img src="https://blog.kakaocdn.net/dn/dwsJdX/btq5vfsvhgR/Cpdc3RBItuKL8iKC9sh4k1/img.png"></p>


<br/>
<br/>


😎 Architecture
-----------------  

<p align="center"><img src="https://user-images.githubusercontent.com/52685665/119842034-4c5ee900-bf41-11eb-9164-c4bba92822f2.png"></p>


<br/>
<br/>

😎 ERD
-----------------  

<br/>
<br/>

채팅방 관리를 위해 채팅방 테이블, 채팅 테이블 유저, 채팅 메시지 테이블을 만들었습니다.  
또한 강퇴당한 사람 관리를 위해 강퇴 테이블도 만들었습니다.  

저희 saleItem 테이블에는 status라는 코드가 있는데 이를 위해서 code라는 공통 코드 관리 테이블을 만들어서  
언제든지 내용을 쉽게 바꿀 수 있도록 하였습니다.  

또한 saleItem row는 deadeLine 컬럼의 시간이 지나면 자동으로 status가 변경되어야 했기 때문에 아래의 이벤트를 적용했습니다.  

```sql
CREATE EVENT IF NOT EXISTS exchange_Fail ON SCHEDULE EVERY 1 HOUR STARTS '2021-05-20 00:00:00'
    ON COMPLETION NOT PRESERVE
    ENABLE
    COMMENT 'If the exchange is not made within the specified time, make it fail...'
    DO 
    UPDATE saleItem SET status = 'SI03' WHERE status = 'SI01' AND deadLine <= now();
```

<br/>
<br/>

<p align="center"><img src="https://user-images.githubusercontent.com/52685665/119867416-d6ff1280-bf58-11eb-9126-97937cf8221d.png"></p>


<br/>
<br/>

🤭 Nest Js Socket Io   
-----------------

<br/>
<br/>

저희는 Nest Js를 사용해서 Socket Io 서비스를 구현하였습니다.  
하면서 가장 어려웠던 점은 일단 Nest Js Socket Io 예제가 너무 적었습니다.  
그래서 공식문서를 보면서 이해를 하였고 이해하지 못한 기술들은 **Nest Js Discord**에서 해답을 얻거나  
**StackOverFlow**에 물어보는 식으로 해결하였습니다.

<br/>
<br/>

Nest Js는 Socket Io를 사용할 때 **@WebSocketGateway**를 사용해서 Socket io 연결을 진행합니다.  

```javascript
@WebSocketGateway({
	namespace: '/chatting'
})
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  }
```

<br/>
<br/>

메시지를 보낼때는 javascript socket io와 똑같이 emit으로 보내고 on으로 받습니다.  
다만, Nest Js는 on으로 소켓을 받지않고 **@SubscribeMessage()** 를 사용해서 받습니다.  

즉, 보내는 쪽에서 emit('sendMsg')로 보내면 chat.gateway.ts에서는 @SubscribeMessage('sendMsg')로 받습니다.

```javascript
	@SubscribeMessage('sendMsg')
	async handleMessage(client: Socket, itemChatDto: ItemChatDto) {
		const chatMsg = await this.chatService.saveChatMsg(itemChatDto);
		if (chatMsg['msg'] == 'success') {
			this.server.to(itemChatDto.icrId).emit('getMsg', chatMsg['data']);
		} else {
			client.emit('getMsg', chatMsg['errorMsg']);
		}
	}
```


<br/>
<br/>

🤭 Nginx   
-----------------

<br/>
<br/>

웹사이트의 동시접속 처리를 위해 Nginx를 사용하였습니다. 하지만 그 중요한 로드밸런싱 처리는 안돼 있습니다.  
저희가 프론트와 함께 채팅 기능을 구현하는데 너무 오랜 시간이 걸렸기 때문에 그런걸 신경쓸 시간이 없었답니다.  
더군다나, 중간에 설정을 잘못해 버려서 자꾸 cors 문제가 떳습니다.  

<br/>
<br/>

처음에는 해당 코드를 사용해서 nginx를 설정했습니다.  
그런데 이렇게 사용하였을 때 발생한 문제점의 꽤나 어메이징 했습니다.  


```bash
server {
            server_name dongmul.shop;
            location / {
                        proxy_hide_header Access-Control-Allow-Origin;
                        add_header 'Access-Control-Allow-Origin' '*';
                        proxy_set_header HOST $host;
                        proxy_pass https://127.0.0.1:3000;
                        proxy_redirect off;
           }

            listen 443 ssl;
            ssl_certificate /etc/letsencrypt/live/dongmul.shop/fullchain.pem;
            ssl_certificate_key /etc/letsencrypt/live/dongmul.shop/privkey.pem;
            include /etc/letsencrypt/options-ssl-nginx.conf;
            ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
            client_max_body_size 0;
}

# 80포트로 들어와도 443으로 꺾어줘야 돼
server {
            server_name dongmul.shop;
            listen 80;
            listen [::]:80;
            return 301 https://$host$request_uri;
}

```
  
<br/>
<br/>  
  
### 1. proxy_hide_header로 인한 cors  

일단, 몇몇 api에서 cors 문제가 발생하였습니다. 다른 api는 잘 작동하는데 어떤 api 하나만 cors 문제가 떳습니다.  
그래서 문제를 찾는 것이 쉽지 않았습니다. 찾아보니 proxy_hide_header라는 녀석이  
클라이언트에게 숨길 헤더를 추가하는 기능을 하는데, 숨겨버리는 바람에 cors 문제가 발생한 것이 아닌가 싶습니다.  

실제로 해당 코드를 제거하니 cors 문제는 발생하지 않았습니다.  

<br/>
<br/>

### 2. add_header로 인한 문제 발생  

제가 착각을 했던게 Nginx를 사용하면, Nest js에서 cors를 해주고, Nginx에서도 한번 더 해줘야 한다고 생각했습니다.  
그래서 둘다 cors 처리를 해주었는데, 이렇게 하니까 Access-Control-Allow-Origin 헤더가 2개씩 올라가서 오류가 생겼습니다.  

우여곡절 끝에 문제점을 찾아내서 현재 저희 동물 마켓 Nginx 설정은 이렇게 되어 있습니다.  

```bash
server {
            server_name dongmul.shop;
            location / {
                        proxy_set_header HOST $host;
                        proxy_pass https://127.0.0.1:3000;
                        proxy_redirect off;
           }

            listen 443 ssl;
            ssl_certificate /etc/letsencrypt/live/dongmul.shop/fullchain.pem;
            ssl_certificate_key /etc/letsencrypt/live/dongmul.shop/privkey.pem;
            include /etc/letsencrypt/options-ssl-nginx.conf;
            ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
            client_max_body_size 0;
}

server {
            server_name dongmul.shop;
            listen 80;
            listen [::]:80;
            return 301 https://$host$request_uri;
}

``` 

아무래도 https 환경이고 Nginx도 처음 설정하는 것이다 보니, 엄청나게 오류가 많이 발생했습니다.  
프론트에서는 cors 문제가 발생하는데 nginx에는 어떤 로그도 안찍히는 경우도 있었고, 그러다보니 트러블 슈팅하는 것도  
엄청 오래 걸렸습니다 ㅠㅠ....  

소켓이랑 nginx 기본 설정하는 곳에서 트러블 슈팅하는거에 시간을 많이 뺏기지 않았다면 좀 더 많이 개발을 할 수 있었을 거란 생각이 듭니다.
