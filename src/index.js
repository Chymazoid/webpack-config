import * as $ from 'jquery'
import Post from '@models/Post'
// import json from './assets/json'
import './styles/style.css'
import './styles/less.less'
import WebpackLogo from './assets/webpack.svg'
import './bable'


const post = new Post('Webpack POst title' , WebpackLogo)
$('pre').addClass('code').html(post.toString())

console.log(post.toString())

//console.log(json)