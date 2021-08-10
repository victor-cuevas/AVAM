import {SeedTestPage} from './app.po';

describe('cli-test App', () => {
	let page: SeedTestPage;

	beforeEach(() => {
		page = new SeedTestPage();
	});

	it('should display "Anmeldung"', done => {
		page.navigateTo();
		page.getParagraphText()
			.then(msg => expect(msg).toEqual(
				'Anmeldung'))
			.then(done, done.fail);
	});
});
