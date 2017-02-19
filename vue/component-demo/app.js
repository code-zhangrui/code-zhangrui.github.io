// import test from './test.js'
// test();
// 
import Vue from 'vue'

Vue.component('todo-item', {
	props: ['todo'],
	template: '<li>{{ todo.text }}</li>'
});

new Vue({
	el: '#app',
	data: {
		dataArr: [
			{text: '1'},
			{text: '2'},
			{text: '3'},
		]
	}
});