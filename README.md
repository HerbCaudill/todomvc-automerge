## Automerge TodoMVC demo

This is an example of how [Automerge](http://github.com/automerge/automerge) might be used to create a [local-first](http://inkandswitch.com/local-first.html) todo list, where multiple users can view and edit the list collaboratively _without_ a traditional web server.

<img src='./img/screencast-automerge-todo.gif' alt='Screencast showing two browsers side-by-side with a todo list on each side. As changes are made in one browser, they are reflected in the other.' />

### Peer-to-peer syncing using Automerge

<a href='http://github.com/automerge/automerge'><img src='https://raw.githubusercontent.com/automerge/automerge/main/img/sign.svg' width='300' alt='Automerge logo' /></a>

Automerge is a CRDT that allows a JSON object to be modified concurrently by different users, and merged again automatically.

[![](./img/automerge-video.png)](https://www.youtube.com/watch?v=GXJ0D2tfZCM)

### Networking via a relay server

<a href='' ><img src='https://raw.githubusercontent.com/local-first-web/branding/main/svg/relay-h.svg' width=450 alt='@localfirst/relay logo'></a>

For discovery and networking, this demo uses [@localfirst/relay](https://github.com/local-first-web/relay), which is a tiny service that helps applications connect with peers on other devices.

![](https://github.com/local-first-web/relay/raw/master/images/relay-connection.png)

You can deploy one or more relays at little or no cost using cloud services including
[Glitch](http://github.com/local-first-web/relay-deployable#deploying-to-glitch),
[Heroku](http://github.com/local-first-web/relay-deployable#deploying-to-heroku),
[AWS](http://github.com/local-first-web/relay-deployable#deploying-to-aws-elastic-beanstalk),
[Google](http://github.com/local-first-web/relay-deployable#deploying-to-google-cloud),
[Azure](http://github.com/local-first-web/relay-deployable#deploying-to-azure), or to a
[local server](http://github.com/local-first-web/relay-deployable#installing-and-running-locally).
