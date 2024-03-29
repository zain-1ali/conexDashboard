import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db, storage } from "./firebase";
import { toast } from "react-toastify";
import {
  equalTo,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { getDownloadURL, uploadString, ref as sRef } from "firebase/storage";
let cnxUid = localStorage.getItem("connexUid");
let conexParent = localStorage.getItem("conexParent");

let cnxId = conexParent ? conexParent : cnxUid;

// ------------------------------------------------Login User-----------------------------------------------

export const handleLogin = (data, navigate) => {
  console.log("testing");
  if (data?.email && data?.password) {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("user", user);
        if (user) {
          const starCountRef = query(
            ref(db, "/Users"),
            orderByChild("id"),
            equalTo(user?.uid)
          );
          onValue(starCountRef, async (snapshot) => {
            const data = await snapshot.val();
            console.log("data", data);
            let dataArray = Object.values(data)?.[0];
            console.log(dataArray);
            if (dataArray?.isAdmin === true) {
              localStorage.setItem("connexUid", user?.uid);
              localStorage.setItem("conexParent", dataArray?.parentID);
              navigate("/home");
              window.location.reload();
            } else {
              toast.warn("Access Denied!");
            }
            // console.log(data);
            // console.log("testing data");
            MediaKeyStatusMap;
            // setmylist(Object.values(data));

            // setfiltered(Object.values(data));

            // updateStarCount(postElement, data);
          });
        }

        //   const starCountRef = ref(db, `/User/${user?.uid}`);
        //   onValue(starCountRef, async (snapshot) => {
        //     const data = await snapshot.val();
        //     if (data?.parentId) {
        //       const starCountRef2 = ref(db, `/User/${data?.parentId}`);
        //       onValue(starCountRef2, async (thesnapshot) => {
        //         const parentdata = await thesnapshot.val();

        //         if (parentdata?.allowTeamLogin === true) {
        //           localStorage.setItem("tapNowUid", user.uid);
        //           navigate("/home");
        //           toast.success("Login Sucessfuly");
        //           window.location.reload(true);
        //         } else {
        //           toast.warning("Access Denied!");
        //         }
        //       });
        //     } else {
        //       localStorage.setItem("tapNowUid", user.uid);
        //       toast.success("Login Sucessfuly");
        //       navigate("/home");
        //       window.location.reload(true);
        //     }
        //   });

        // toast.success('Login Sucessfuly')

        // navigate('/home')

        // ...
      })
      .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        // alert(errorMessage)

        console.log(error.message);

        if (error.message === "Firebase: Error (auth/user-not-found).") {
          toast.error("User not Found !");
        } else if (error.message === "Firebase: Error (auth/wrong-password).") {
          toast.error("Wrong Password !");
        }
      });
  } else {
    toast.error("Email and password should not be empty!");
  }
};

// ------------------------------------------------Forget Password-----------------------------------------------

export const forgetPassword = (email) => {
  if (!email) {
    toast.error("Email field is requirde");
  } else {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.success(
          "An email have been sent to you, please verify to change password"
        );
        // ..
      })
      .catch((error) => {
        console.log(error.message);
        if (error.message === "Firebase: Error (auth/user-not-found).") {
          toast.error("User not found!");
        }
      });
  }
};

// ------------------------------------------------Create new card-----------------------------------------------
let randNum = () => {
  let val = Math.floor(1000 + Math.random() * 9000);
  return val;
};
export const createNewCard = async (data, callBack) => {
  if (data.name && data.email && data.password) {
    await createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // console.log(user.uid)
        let cnxId = localStorage.getItem("connexUid");
        update(ref(db, `Users/${user.uid}`), {
          platform: "web",
          address: "",
          backgroundColor: "#000000",
          bio: "",
          city: "",
          color: "#000000",
          coverUrl: "",
          darkTheme: "0",
          directMode: false,
          dob: "",
          email: data.email,
          fcmToken: "",
          gender: "",
          id: user.uid,
          isActivateTag: false,
          isCover: false,
          isCustomLink: false,
          isDeleted: false,
          isEmail: true,
          isFirstLink: false,
          isProVersion: false,
          isProfile: false,
          isProfilePhoto: false,
          isReqByMe: false,
          isReqByOther: false,
          isShareProfile: false,
          isSubscribe: false,
          job: "",
          language: "en",
          logoUrl: "",
          name: data?.name,
          parentID: cnxId,
          parentId: "",
          phone: "",
          proVersionExpiryDate: "",
          proVersionPurchaseDate: "",
          profileOn: 1,
          profileUrl: "",
          socialTextColor: "#FF000000",
          title: "",
          totalViews: 0,
          username: randNum() + data?.name + user.uid,
          website: "",
          workPlace: "",
          formHeader: "Contact me!",
          leadForm: {
            Fname: true,
            company: true,
            email: true,
            job: true,
            note: true,
            phone: true,
          },
          isAdmin: false,
          qrLogoUrl: "",
          leadMode: false,
        }).then(() => {
          toast.success("New user created sucessfuly");
          handleTeamModal();
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        //   const errorMessage = error.message;
        console.log(error.message);
        if (error.message === "Firebase: Error (auth/invalid-email).") {
          toast.error("Please enter valid email");
        } else if (
          error.message === "Firebase: Error (auth/email-already-in-use)."
        ) {
          toast.error("Email already exits");
        } else if (
          error.message ===
          "Firebase: Password should be at least 6 characters (auth/weak-password)."
        ) {
          toast.error("Password must be at least 6 characters");
        }

        // ..
      });

    callBack();
  } else {
    toast.error("Email , password and user name should not be empty");
  }
};
// ------------------------------------------------Get all child profiles-----------------------------------------------

export const getAllChilds = async (callBackFunc, setloading) => {
  setloading(true);
  const starCountRef = query(
    ref(db, "/Users"),
    orderByChild("parentID"),
    equalTo(cnxId)
  );
  onValue(starCountRef, async (snapshot) => {
    const data = await snapshot.val();
    callBackFunc(data);
    console.log(data);
    setloading(false);
    console.log("testing data");
    MediaKeyStatusMap;
    // setmylist(Object.values(data));

    // setfiltered(Object.values(data));

    // updateStarCount(postElement, data);
  });
};

// ------------------------------------------------Get single child profile-----------------------------------------------

export const getSingleChild = (id, callBackFunc, setloading) => {
  const starCountRef = query(
    ref(db, "/Users"),
    orderByChild("id"),
    equalTo(id)
  );
  onValue(starCountRef, async (snapshot) => {
    const data = await snapshot.val();
    callBackFunc(data);
    console.log(data);
    console.log("testing data");
    MediaKeyStatusMap;
    // setmylist(Object.values(data));

    // setfiltered(Object.values(data));

    // updateStarCount(postElement, data);
  });
};

// ------------------------------------------------Update About Data-----------------------------------------------

let returnIfHttps = (string) => {
  if (string != "" && string) {
    if (string?.slice(0, 4) === "http") {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

export const updataAbout = async (id, data) => {
  let {
    name,
    job,
    address,
    coverUrl,
    phone,
    bio,
    profileUrl,
    logoUrl,
    color,
    textColor,
  } = data;
  // if (name || location || job || company || bio || colorCode) {
  update(ref(db, `Users/${id}`), {
    name,
    job,
    address,
    phone,
    // colorCode,
    // job,
    // company,
    bio,
    profileUrl,
    logoUrl,
    coverUrl,
    color,
    textColor,
  }).then(() => {
    if (returnIfHttps(profileUrl) === false) {
      let name = new Date().getTime() + id;
      const storageRef1 = sRef(storage, name);
      uploadString(storageRef1, profileUrl.slice(23), "base64", {
        contentType: "image/png",
      })
        .then(() => {
          console.log("img testing");
          getDownloadURL(storageRef1)
            .then((URL) => {
              // console.log(URL)
              update(ref(db, `Users/${id}`), { profileUrl: URL });
              // setprflimg("");
              // window.location.reload();
            })
            .catch((error) => {
              console.log(error);
            });
          // setimg(null)
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (returnIfHttps(coverUrl) === false) {
      let name = new Date().getTime() + id;
      const storageRef2 = sRef(storage, name);
      uploadString(storageRef2, coverUrl.slice(23), "base64", {
        contentType: "image/png",
      })
        .then(() => {
          console.log("img testing");
          getDownloadURL(storageRef2)
            .then((URL) => {
              // console.log(URL)
              update(ref(db, `Users/${id}`), { coverUrl: URL });
              // setBgImg("");
              // window.location.reload();
            })
            .catch((error) => {
              console.log(error);
            });
          // setimg(null)
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (returnIfHttps(logoUrl) === false) {
      let name = new Date().getTime() + id;
      const storageRef3 = sRef(storage, name);
      uploadString(storageRef3, logoUrl.slice(23), "base64", {
        contentType: "image/png",
      })
        .then(() => {
          console.log("img testing");
          getDownloadURL(storageRef3)
            .then((URL) => {
              // console.log(URL)
              update(ref(db, `Users/${id}`), { logoUrl: URL });
              // setlogoImg("");
              // window.location.reload();
            })
            .catch((error) => {
              console.log(error);
            });
          // setimg(null)
        })
        .catch((error) => {
          console.log(error);
        });
    }
    toast.success("Information updated sucessfuly");
  });
  // }
};

// ------------------------------------------------Update Qr Data-----------------------------------------------

export const updateQrInfo = async (id, qrColor, logoimg) => {
  // if (qrColor || qrLogo) {
  // toast.success("Information updated successfuly");
  console.log("qr testing", logoimg);
  console.log("qrlogo", logoimg);
  update(ref(db, `Users/${id}`), { qrColor, qrLogoUrl: logoimg }).then(() => {
    if (returnIfHttps(logoimg) === false) {
      let name = new Date().getTime() + id;
      const storageRef = sRef(storage, name);
      uploadString(storageRef, logoimg.slice(23), "base64", {
        contentType: "image/png",
      })
        .then(() => {
          console.log("img testing");
          getDownloadURL(storageRef)
            .then((URL) => {
              // console.log(URL)
              update(ref(db, `Users/${id}`), { qrLogoUrl: URL });
              // setlogoimg("");
              // window.location.reload();
            })
            .catch((error) => {
              console.log(error);
            });
          // setimg(null)
        })
        .catch((error) => {
          console.log(error);
        });
    }
    toast.success("Information updated successfuly");
  });
  // console.log("qrrrrr");

  // }
};

// ------------------------------------------------Update lead Data-----------------------------------------------

export const updateLead = async (id, formHeader, leadForm) => {
  update(ref(db, `Users/${id}`), { formHeader, leadForm }).then(() => {
    toast.success("Information updated successfuly");
  });
};

// ------------------------------------------------Create New Team-----------------------------------------------

export const createTeam = async (data, callBack) => {
  if (data?.name) {
    // toast.success("Information updated successfuly");
    let pushKey = push(ref(db, `Teams/`), {
      teamName: data?.name,
      companyId: cnxId,
    }).key;

    update(ref(db, `Teams/${pushKey}`), { teamId: pushKey }).then(() => {
      if (returnIfHttps(data?.img) === false) {
        let name = new Date().getTime() + pushKey;
        const storageRef = sRef(storage, name);
        uploadString(storageRef, data?.img.slice(23), "base64", {
          contentType: "image/png",
        })
          .then(() => {
            console.log("img testing");
            getDownloadURL(storageRef)
              .then((URL) => {
                // console.log(URL)
                update(ref(db, `Teams/${pushKey}`), { image: URL }).then(() => {
                  toast.success("New team created successfuly");
                  callBack();
                });
                // setlogoimg("");
                // window.location.reload();
              })
              .catch((error) => {
                console.log(error);
              });
            // setimg(null)
          })
          .catch((error) => {
            console.log(error);
            callBack();
          });
      } else {
        toast.success("New team created successfuly");
        callBack();
      }
    });
    // console.log("qrrrrr");
  } else {
    toast.error("Team name should not be empty");
  }
};

// ------------------------------------------------Get all teams-----------------------------------------------

export const getAllTeams = async (callBackFunc, setloading) => {
  setloading(true);
  const starCountRef = query(
    ref(db, "/Teams"),
    orderByChild("companyId"),
    equalTo(cnxId)
  );
  onValue(starCountRef, async (snapshot) => {
    const data = await snapshot.val();
    if (data) {
      callBackFunc(data);
      setloading(false);
    }

    console.log(data);
    console.log("testing data");
    MediaKeyStatusMap;
    // setmylist(Object.values(data));

    // setfiltered(Object.values(data));

    // updateStarCount(postElement, data);
  });
};

// ------------------------------------------------Add team member-----------------------------------------------

export const addTeamMember = (team, membersId, cb) => {
  if (membersId.length > 0) {
    if (team?.members) {
      let memberArray = Object.values(team?.members);
      set(ref(db, `Teams/${team?.teamId}/members/`), [
        ...memberArray,
        ...membersId,
      ]).then(() => {
        toast.success("Team updated successfuly");
        cb();
      });
    } else {
      set(ref(db, `Teams/${team?.teamId}/members/`), [...membersId]).then(
        () => {
          toast.success("Team updated successfuly");
          cb();
        }
      );
    }
  } else {
    toast.error("Please add atleast 1 member");
  }
};

// ------------------------------------------------Get single child profile-----------------------------------------------

export const getAllTeamMembers = (arr, callBack, members) => {
  if (arr) {
    console.log(arr);
    Object.values(arr)?.map((elm) => {
      const starCountRef = query(
        ref(db, "/Users"),
        orderByChild("id"),
        equalTo(elm)
      );
      onValue(starCountRef, async (snapshot) => {
        const data = await snapshot.val();
        callBack((prev) => [...prev, ...Object.values(data)]);
        console.log(data);
        console.log("testing data");
        MediaKeyStatusMap;
      });
    });
  }
};

// ----------------------------------------------------Add link to database---------------------------------------------

export const addNewLink = (linkData, id, allLinks, handleLinkEditModal) => {
  if (linkData?.value) {
    if (allLinks) {
      set(ref(db, `Users/${id}/links/`), [...allLinks, linkData]).then(() => {
        toast.success("Link added successfuly");
        handleLinkEditModal();
      });
    } else {
      set(ref(db, `Users/${id}/links/`), [linkData]).then(() => {
        toast.success("Link added successfuly");
        handleLinkEditModal();
      });
    }
  }

  // if (theLink.value && theLink.name) {
  //   if (
  //     title.includes("Link") ||
  //     title.includes("link") ||
  //     title.includes("Url")
  //   ) {
  //     if (isURL(theLink.value)) {
  //       if (link) {
  //       }
  //     } else {
  //       toast.error("Invalid url or link");
  //     }
  //   }

  // else {
  //   if (link) {
  //     set(ref(db, `User/${user?.id}/links/`), [...link, theLink]).then(
  //       () => {
  //         toast.success("Link added successfuly");
  //         dispatch(openLinkModal());
  //         dispatch(removeLink());
  //         dispatch(setLinkHighlight(false));
  //         dispatch(setLinkDescription(""));
  //         settheLink({
  //           isHide: false,
  //           isHighLighted: false,
  //           name: singlelink.name,
  //           title: "",
  //           value: "",
  //           description: "",
  //         });
  //       }
  //     );
  //   }
  // }
  // }
};

// ----------------------------------------------------Update link to database---------------------------------------------

export const updateNewLink = (linkData, id, allLinks, handleLinkEditModal) => {
  // if (linkData?.value) {
  if (allLinks) {
    let index = allLinks?.findIndex((elm) => {
      return elm?.linkID === linkData?.linkID;
    });

    update(ref(db, `Users/${id}/links/${index}`), { ...linkData }).then(() => {
      handleLinkEditModal();
      toast.success("Link updated successfuly");
    });
  }
  // }
};

// ----------------------------------------------------Remove link from database---------------------------------------------

export const renoveLink = (linkData, id, allLinks, cb) => {
  // if (linkData?.value) {
  if (allLinks) {
    let remainingLinks = allLinks?.filter((elm) => {
      return elm?.linkID != linkData?.linkID;
    });

    set(ref(db, `Users/${id}/links/`), [...remainingLinks]).then(() => {
      cb();
      toast.success("Link deleted successfuly");
    });
  }
  // }
};

// ----------------------------------------------------Handle to change lead mode---------------------------------------------

export const updateLeadMode = (leadMode, id) => {
  update(ref(db, `Users/${id}/`), { leadMode: !leadMode });
};

// ---------------------------------------Handle to change direct mode----------------------------------

export const handleChangeDirect = (directMode, id, link) => {
  // e.preventDefault()
  if (directMode) {
    update(ref(db, `Users/${id}`), {
      directMode: false,
      direct: { name: "", value: "", title: "" },
    }).then(() => {
      // navigate('/profileedit')
    });
  } else {
    update(ref(db, `Users/${id}`), {
      directMode: true,
      direct: {
        name: link[0]?.name,
        value: link[0]?.value,
        linkID: link[0]?.linkID,
      },
    }).then(() => {
      // navigate('/profileedit')
    });
  }
};

export const addtoDirect = (name, linkID, value, id) => {
  update(ref(db, `Users/${id}/`), {
    direct: { name, linkID, value },
  });
};

// ---------------------------------------Handle delete company----------------------------------
export const deleteCompany = (id, callBack) => {
  remove(ref(db, `Teams/${id}`)).then(() => {
    callBack();
    toast.success("Team deleted successfuly");
  });
};

// ---------------------------------------Handle change Profile Status----------------------------------
export const changeProfileStatus = (status, id) => {
  if (status === 1) {
    update(ref(db, `Users/${id}/`), { profileOn: 0 });
  } else {
    update(ref(db, `Users/${id}/`), { profileOn: 1 });
  }
};

// ------------------------------------------------Get single child profile-----------------------------------------------

export const getContacts = (id, cb) => {
  const starCountRef = query(
    ref(db, "/Contacts"),
    orderByChild("userid"),
    equalTo(id)
  );
  onValue(starCountRef, async (snapshot) => {
    const data = await snapshot.val();
    cb(Object.values(data));
    console.log(data);

    MediaKeyStatusMap;
  });
};

// ---------------------------------------Handle delete contact----------------------------------
export const deleteContact = (id) => {
  remove(ref(db, `Contacts/${id}`)).then(() => {
    toast.success("Contact deleted successfuly");
  });
};

export const updataCompanyAbout = async (id, data) => {
  let {
    name,
    address,
    phone,
    bio,
    nameLock,
    phoneLock,
    locationLock,
    bioLock,
  } = data;
  update(ref(db, `Users/${id}`), {
    name,
    address,
    phone,
    nameLock,
    phoneLock,
    locationLock,
    bioLock,
    bio,
  }).then(() => {
    // const starCountRef = query(
    //   ref(db, "/Users"),
    //   orderByChild("parentID"),
    //   equalTo(id)
    // );
    // onValue(starCountRef, async (snapshot) => {
    //   const thedata = await snapshot.val();
    //   if (thedata) {
    //     // let allChilds = Object.keys(thedata);
    //     Object.keys(thedata)?.forEach(async (elm) => {
    //       await update(ref(db, `Users/${elm}`), {
    //         nameLock,
    //         phoneLock,
    //         locationLock,
    //         bioLock,
    //       });
    //     });
    //   }

    //   toast.success("Information updated sucessfuly");

    //   // console.log(data);
    //   // MediaKeyStatusMap;
    // });
    // updateBulkData(id, nameLock, phoneLock, locationLock, bioLock);
    toast.success("Information updated sucessfuly");
  });

  // }
};

// ------------------------------------------------update Company Profile-----------------------------------------------

export const updateCompanyProfile = async (id, data) => {
  let {
    coverUrl,
    profileUrl,
    logoUrl,
    color,
    textColor,
    coverLock,
    logoLock,
    profilePictureLock,
  } = data;
  // if (name || location || job || company || bio || colorCode) {
  update(ref(db, `Users/${id}`), {
    color,
    textColor,
    profileUrl,
    logoUrl,
    coverUrl,
    coverLock,
    logoLock,
    profilePictureLock,
  }).then(() => {
    if (returnIfHttps(profileUrl) === false) {
      let name = new Date().getTime() + id;
      const storageRef = sRef(storage, name);
      uploadString(storageRef, profileUrl.slice(23), "base64", {
        contentType: "image/png",
      })
        .then(() => {
          console.log("img testing");
          getDownloadURL(storageRef)
            .then((URL) => {
              // console.log(URL)
              update(ref(db, `Users/${id}`), { profileUrl: URL });
              // setprflimg("");
              // window.location.reload();
            })
            .catch((error) => {
              console.log(error);
            });
          // setimg(null)
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (returnIfHttps(coverUrl) === false) {
      let name = new Date().getTime() + id;
      const storageRef = sRef(storage, name);
      uploadString(storageRef, coverUrl.slice(23), "base64", {
        contentType: "image/png",
      })
        .then(() => {
          console.log("img testing");
          getDownloadURL(storageRef)
            .then((URL) => {
              // console.log(URL)
              update(ref(db, `Users/${id}`), { coverUrl: URL });
              // setBgImg("");
              // window.location.reload();
            })
            .catch((error) => {
              console.log(error);
            });
          // setimg(null)
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (returnIfHttps(logoUrl) === false) {
      let name = new Date().getTime() + id;
      const storageRef = sRef(storage, name);
      uploadString(storageRef, logoUrl.slice(23), "base64", {
        contentType: "image/png",
      })
        .then(() => {
          console.log("img testing");
          getDownloadURL(storageRef)
            .then((URL) => {
              // console.log(URL)
              update(ref(db, `Users/${id}`), { logoUrl: URL });
              // setlogoImg("");
              // window.location.reload();
            })
            .catch((error) => {
              console.log(error);
            });
          // setimg(null)
        })
        .catch((error) => {
          console.log(error);
        });
    }
    toast.success("Information updated sucessfuly");
  });
  // }
};

// ------------------------------------------------update Team-----------------------------------------------

export const updateTeam = async (data, callBack, teamId) => {
  if (data?.name) {
    update(ref(db, `Teams/${teamId}`), { teamName: data?.name }).then(() => {
      if (returnIfHttps(data?.img) === false) {
        let name = new Date().getTime() + teamId;
        const storageRef = sRef(storage, name);
        uploadString(storageRef, data?.img.slice(23), "base64", {
          contentType: "image/png",
        })
          .then(() => {
            console.log("img testing");
            getDownloadURL(storageRef)
              .then((URL) => {
                // console.log(URL)
                update(ref(db, `Teams/${teamId}`), { image: URL });
                // setlogoimg("");
                // window.location.reload();
              })
              .catch((error) => {
                console.log(error);
              });
            // setimg(null)
          })
          .catch((error) => {
            console.log(error);
            callBack();
          });
      }
      toast.success("updated successfuly");
      callBack();
    });
    // console.log("qrrrrr");
  } else {
    toast.error("Team name should not be empty");
  }
};

// ----------------------------------------------------Remove Team Member---------------------------------------------

export const removeTeamMember = (userId, teamId, allMembers, cb) => {
  // if (linkData?.value) {
  if (allMembers) {
    let remainingMembers = allMembers?.filter((elm) => {
      return elm != userId;
    });

    set(ref(db, `Teams/${teamId}/members/`), [...remainingMembers]).then(() => {
      cb(userId);
      toast.success("Team member deleted successfuly");
    });
  }
  // }
};

// ----------------------------------------------------Split String---------------------------------------------

export const splitString = (str, num) => {
  if (str) {
    if (str?.length > num) {
      let endStr = str?.slice(0, num);
      return endStr + "...";
    } else {
      return str;
    }
  }
};

// ----------------------------------------------------Split String---------------------------------------------

export const updateLinkShareAble = async (id, linkID, shareable, link) => {
  // shareable,allLinks
  // Find the index of the object with the given ID
  const objectIndex = link?.findIndex((obj) => obj.linkID === linkID);

  // Check if the object exists
  if (objectIndex !== -1) {
    // Create a copy of the object
    const updatedObject = { ...link[objectIndex] };

    // Update the value of the desired property
    updatedObject.shareable = !shareable;

    // Create a new array with the updated object
    const updatedArray = [...link];
    updatedArray[objectIndex] = updatedObject;
    set(ref(db, `Users/${id}/links/`), [...updatedArray]);
  }

  // const starCountRef = query(
  //   ref(db, `/Users/${id}/links`),
  //   orderByChild("linkID"),
  //   equalTo(linkID)
  // );
  // onValue(starCountRef, async (snapshot) => {
  //   const data = await snapshot.val();
  //   // cb(Object.values(data));
  //   console.log(data);
  //   console.log(Object.keys(data)[0]);
  //   if (data) {
  //     let index = Object.keys(data)[0];

  //     update(ref(db, `Users/${id}/links/${index}`), {
  //       shareable: !shareable,
  //     }).then(() => {
  //       // toast.success("Link deleted successfuly");
  //       // cb();
  //     });
  //   }
  //   MediaKeyStatusMap;
  // });
};

// ------------------------------------------------Get single child profile-----------------------------------------------

export const getSingleChildAnalytics = (id, callBackFunc, setloading) => {
  setloading(true);
  const starCountRef = query(
    ref(db, "/Analytic"),
    orderByChild("userid"),
    equalTo(id)
  );
  onValue(starCountRef, async (snapshot) => {
    const data = await snapshot.val();
    callBackFunc(data);
    setloading(false);
    // console.log(data);
    // console.log("testing data");
    MediaKeyStatusMap;
    // setmylist(Object.values(data));

    // setfiltered(Object.values(data));

    // updateStarCount(postElement, data);
  });
};

export const handleLogout = (cb) => {
  localStorage.removeItem("connexUid");
  localStorage.removeItem("conexParent");
  cb();
};
