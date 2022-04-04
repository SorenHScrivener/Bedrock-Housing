//Look up how to bundle scss here using webpack and make this into an import file(Also use seperate file for gen logic, 
//so can conditional this for forms)
import '../css/style.css';
import '../css/dots.css'

import Search from './modules/search';
import Pagination from './modules/pagination';
import News from './modules/all-news';
import RelatedNews from './modules/singlePost';
import ShadowBox from './modules/shadowBox';

const search = new Search();
const pagination = new Pagination();
const news = new News();
const relatedNews = new RelatedNews();
const shadowBox = new ShadowBox();