import React from "react";


class SettingsView extends React.Component {
    render() {
        return <div id="page-content">
                    <h1 id="page-headline">Settings</h1>
                    <table className={"formtable"}>
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td><input type="text" className="mcweb-ui"></input></td>
                            </tr>
                            <tr>
                                <td>Port</td>
                                <td><input className="mcweb-ui" type="number" min={25000} defaultValue={25565} max={30000}></input></td>
                            </tr>
                            <tr>
                                <td colSpan={2}><button className="mcweb-ui">Save Changes</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>;
    }
}

export default SettingsView;
