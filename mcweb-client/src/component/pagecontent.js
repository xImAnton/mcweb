import React from "react";


class PageContent extends React.Component {

    render() {
        let filler = Array(26).fill(<p>content</p>)
        return <div id="content-wrapper">
                    <div id="page-content">
                        <h1 id="page-headline">General</h1>
                        hi
                        {filler}
                    </div>
                </div>;
    }
}

export default PageContent;