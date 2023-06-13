import React from "react";
import { isAuthenticated } from ".";
import Cookies from "js-cookie";

export default function NeedAuth({ auth, defaults }) {  
    if (!isAuthenticated()) {
      return defaults
    } else {
      return auth;
    }
};    

export const ProcessContent = (content) => {
    const parser = new DOMParser();
    const parsedContent = parser.parseFromString(content, "text/html");
    const textContent = parsedContent.body.textContent;
  
    return textContent;
};

export const GetUser = () => {
  return JSON.parse(Cookies.get("user"))
}