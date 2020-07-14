import HomePage from '../pageobjects/homepage.listing.js'
import { expect } from 'chai';

describe('Spreadsheet Test Cases', function () {
    describe('Landing Page Test cases', function () {
        it('Verify Landing Page is Displayed', function () {
            HomePage.open();
           expect("Record count Label is Displayed").to.equal(HomePage.verifyRecordCountElemtPresent());
        })
    })

})