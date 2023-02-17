import React, { useEffect, useState } from "react";
import agentLogo from "@assets/images/agent-logo.svg";
import get from "lodash/get";
import { isEmpty } from "lodash";
import * as moment from "moment";

import UnknownUser from "@assets/images/profile-avatar-white.png";

import { LOCALSTORAGE } from "@constants";
import { getKey } from "@utils/storage";

import { CLOSE, COMMENT_DETAILS ,GUEST_NAME} from "./constant";

import "./style.scss";



const getfullname = () => {
  let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
  const fullname = userInfo?.firstName + " " + userInfo?.lastName;
  return fullname;
};

const getinitials = () => {
  let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
  const initials = userInfo?.firstName.charAt(0) + userInfo?.lastName.charAt(0);
  const userinitials = initials?.toUpperCase();
    return userinitials;
};

const getStatus = (data, cardData) => {
  const { filteredData, commentDate, commentKey } = data;
  if (filteredData) {
    const status = cardData.statusChange.filter(
      (data) => data.status === commentDate
    );
    if (status && status.length > 1 && commentDate === CLOSE) {
      return commentKey === "reCloseComments"
        ? moment.utc(status[0]?.changeDate).format("lll")
        : moment.utc(status[1]?.changeDate).format("lll");
    } else {
      return moment.utc(status[0]?.changeDate).format("lll");
    }
  } else if (!filteredData) {
    return moment.utc(get(cardData, `${commentDate}`)).format("lll");
  } else {
    return;
  }
};

function CommentCard({ cardData }) {
  const [firstName, setFirstName] = useState();

  useEffect(() => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    setFirstName(userInfo?.firstName.charAt(0));
  }, [])
  
  return (
    <>
      {COMMENT_DETAILS &&
        COMMENT_DETAILS.map((data, key) => {
          if (get(cardData, `${data.commentKey}`) && !isEmpty(cardData)) {
            return (
              <div
                className={`agent-comment1 ${data.isUser ? "" : "light"}`}
                key={key}
              >
                <div className="top">
                  <div className="user-shortname">
                    {data.isUser ? firstName ? (
                      <div className="username-text">{getinitials()}</div>
                      
                    ) :
                    <img className ="logged-out-profile" src={UnknownUser} />
                    :
                     (
                      <img src={agentLogo} />
                    )}
                  </div>
                  <div className="user-name">
                    {data?.isUser ? getfullname() : "Binge Support"}
                  </div>
                </div>
                <div className="comments">
                  {get(cardData, `${data.commentKey}`)}
                </div>
                <div className="time">{getStatus(data, cardData)}</div>
              </div>
            );
          }
        })}
    </>
  );
}

export default React.memo(CommentCard);
