import { FunctionComponent } from "react";

export const FileUpload: FunctionComponent<{callback: Function, typesToAllow: string}> = ({callback, typesToAllow}) => {
    /**
     * callback: Function – the function to be called on successful upload
     * typesToAllow: string – ".xxx, .xxx"
     */

    const readFile = async (file: any) => {
        if (!file) return
        const data = await file.text()
        return data;
    }
    
    const handleOnSubmit = (file: any) => {
        if(!file) return;
        else {
            readFile(file).then((e) => {
                console.log(e);
                callback(e);
            }
        );
        }
    };

    return (<input onChange={(e: any) => {
        handleOnSubmit(e.target.files[0]);
    }} type={"file"} accept={typesToAllow}/>);
}

export default FileUpload;