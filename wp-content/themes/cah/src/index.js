//Look up how to bundle scss here using webpack and make this into an import file(Also use seperate file for gen logic, 
//so can conditional this for forms)
import '../css/style.css';
import '../css/dots.css'

// import Search from './modules/search';
import Pagination from './modules/pagination';
import News from './modules/all-news';
import RelatedNews from './modules/singlePost';
import ShadowBox from './modules/shadowBox';
import MobileInterface from './modules/mobile';
import Tab from './modules/tabs';
import DimensionCheck from './modules/dimension-checker';
import MoreOptions from './modules/moreOptions';
import CustomLoaderLogic from './modules/custom-loader-logic';

import RandomColor from './random/random-color';
import RandomBall from './random/random-ball';
// *Important to note that the import doesn't need to be done here if don't want to be independently activated
// import RandomAnimation from './random/random-animation';
// import MovementRecord from './random/movement-tracker';

// const search = new Search();
const pagination = new Pagination();
const news = new News();
const relatedNews = new RelatedNews();
const shadowBox = new ShadowBox();
const mobileInterface = new MobileInterface();
const tab = new Tab();
const dimensionCheck = new DimensionCheck();
const moreOptions = new MoreOptions();

const customLoaderLogic = new CustomLoaderLogic();


// const randomColor = new RandomColor();
// const randomBall = new RandomBall();
// const movementRecord = new MovementRecord();
// const randomAnimation = new RandomAnimation();