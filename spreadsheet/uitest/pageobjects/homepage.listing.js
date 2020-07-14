import Page from '../common/page.js'

class Homepage extends Page {
    get recordCOuntElement() { return $('//*[@class="totalCount"]') }
    open() {
        super.open('');
    }
    verifyRecordCountElemtPresent() {
        this.recordCOuntElement.waitForDisplayed(5000);
        if(this.recordCOuntElement.isDisplayed()){
            return "Record count Label is Displayed";
        }else {return "Record count Label not Displayed"; }
    }
}
export default new Homepage(); 