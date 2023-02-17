export const COMMENT_TYPE = {
    OPENING_COMMENT : 'opening-comment',
    CLOSE_COMMENT: 'close-comment',
    REOPEN_COMMENT: 'reopen-comment',
    RECLOSE_COMMENT: 'reclose-comment',
    };

  export const CLOSE = 'CLOSE'
    
    export const COMMENT_DETAILS = [
      {
        commentType: COMMENT_TYPE.OPENING_COMMENT,
        commentKey: 'description',
        commentDate: 'creationDate',
        filteredData: false,
        isUser: true,
      },
      {
        commentType: COMMENT_TYPE.CLOSE_COMMENT,
        commentKey: 'closeComments',
        commentDate: 'CLOSE',
        filteredData: true,
        isUser: false,
      },
      {
        commentType: COMMENT_TYPE.REOPEN_COMMENT,
        commentKey: 'reopenComments',
        commentDate: 'REOPEN',
        filteredData: true,
        isUser: true,
      },
      {
        commentType: COMMENT_TYPE.RECLOSE_COMMENT,
        commentKey: 'reCloseComments',
        commentDate: 'CLOSE',
        filteredData: true,
        isUser: false,
      },
    ]
    export const GUEST_NAME="G";
    