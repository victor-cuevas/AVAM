import {browser, by, element} from 'protractor';

export class SeedTestPage {
	navigateTo() {
		return browser.get('/');
	}

	getParagraphText() {
		return element(by.id('login')).getText();
	}
}
