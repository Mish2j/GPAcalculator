"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var DOM = {
    checkBox: document.querySelector(".checkBox"),
    resultTable: document.querySelector(".table"),
    tableBody: document.querySelector(".table-body"),
    form: document.querySelector(".gpa-form"),
    resetBtn: document.querySelector(".btn-reset")
  };

  var CourseData = function CourseData(course, unit, grade, id) {
    _classCallCheck(this, CourseData);

    this.course = course;
    this.grade = grade;
    this.unit = unit;
    this.id = id;
  };

  var Store = function () {
    function Store() {
      _classCallCheck(this, Store);
    }

    _createClass(Store, null, [{
      key: "getCourses",
      value: function getCourses() {
        var courses = void 0;
        if (localStorage.getItem("courses") === null) {
          courses = [];
        } else {
          courses = JSON.parse(localStorage.getItem("courses"));
        }

        return courses;
      }
    }, {
      key: "addCourse",
      value: function addCourse(course) {
        var courses = this.getCourses();

        courses.push(course);

        localStorage.setItem("courses", JSON.stringify(courses));

        UI.updateCourseCounter();
        UI.updateGpa();
      }
    }, {
      key: "removeCourseFromLocalStorage",
      value: function removeCourseFromLocalStorage(id) {
        var courses = this.getCourses();

        var filteredCourses = courses.filter(function (course) {
          return course.id != id;
        });

        localStorage.setItem("courses", JSON.stringify(filteredCourses));

        UI.updateCourseCounter();

        UI.updateGpa();
      }
    }, {
      key: "clearLocalStorage",
      value: function clearLocalStorage() {
        localStorage.removeItem("courses");

        UI.toggleDataTable();

        UI.updateCourseCounter();

        UI.updateGpa();
      }
    }, {
      key: "getThemeColor",
      value: function getThemeColor() {
        var themeColor = "";

        if (localStorage.getItem("theme") === null) {
          themeColor = "light";
        } else {
          themeColor = JSON.parse(localStorage.getItem("theme"));
        }

        return themeColor;
      }
    }, {
      key: "setThemeColor",
      value: function setThemeColor(color) {
        localStorage.setItem("theme", JSON.stringify(color));
      }
    }]);

    return Store;
  }();

  var UI = function () {
    function UI() {
      _classCallCheck(this, UI);
    }

    _createClass(UI, null, [{
      key: "toggleDataTable",
      value: function toggleDataTable() {
        var resultCont = document.querySelector(".table-container");

        var courses = Store.getCourses();

        if (courses.length > 0) {
          resultCont.classList.remove("hidden");
        } else {
          DOM.tableBody.innerHTML = "";
          resultCont.classList.add("hidden");
        }
      }
    }, {
      key: "updateCourseCounter",
      value: function updateCourseCounter() {
        var courseCounter = Store.getCourses().length + 1;
        document.querySelector(".class-count").textContent = courseCounter;
      }
    }, {
      key: "updateGpa",
      value: function updateGpa() {
        document.querySelector(".gpa").textContent = GpaCalculator.calculateGpa();
      }
    }, {
      key: "switchThemeColor",
      value: function switchThemeColor() {
        var themeColor = "";

        DOM.checkBox.checked ? themeColor = "dark" : themeColor = "light";

        document.documentElement.setAttribute("data-theme", themeColor);
        Store.setThemeColor(themeColor);
      }
    }, {
      key: "displayCourses",
      value: function displayCourses() {
        var _this = this;

        var courses = Store.getCourses();

        UI.toggleDataTable();

        courses.forEach(function (course) {
          return _this.addToResultTable(course);
        });
      }
    }, {
      key: "displayModal",
      value: function displayModal(title) {
        var messages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        var warnModal = document.querySelector(".warning-modal");
        var modalTextBox = warnModal.querySelector(".modal-text");
        var overlay = document.querySelector(".overlay");
        var btnCloseModal = document.querySelector(".btn-close-modal");

        var headingEl = document.createElement("h3");
        var headingText = document.createTextNode(title);
        headingEl.appendChild(headingText);

        title && modalTextBox.insertAdjacentElement("afterbegin", headingEl);

        messages.forEach(function (msg) {
          var msgEl = document.createElement("p");
          var msgText = document.createTextNode(msg);
          msgEl.appendChild(msgText);
          modalTextBox.insertAdjacentElement("beforeend", msgEl);
        });

        warnModal.classList.toggle("hidden");
        overlay.classList.toggle("hidden");

        var hideModal = function hideModal() {
          modalTextBox.innerHTML = "";

          warnModal.classList.add("hidden");
          overlay.classList.add("hidden");
        };

        btnCloseModal.addEventListener("click", hideModal);
        overlay.addEventListener("click", hideModal);

        document.addEventListener("keydown", function (e) {
          if (e.key !== "Escape") return;
          hideModal();
        });
      }
    }, {
      key: "addToResultTable",
      value: function addToResultTable(courseData) {
        var html = "\n        <tr data-course-id=" + courseData.id + ">\n          <td>" + courseData.course + "</td>\n          <td class=\"class_unit\">" + courseData.unit + "</td>\n          <td class=\"class_grade\">" + courseData.grade + "</td>\n          <td>\n            <button class=\"btn btn-delete-row\">\n              <i class=\"fas fa-times\"></i>\n            </button>\n          </td>\n        </tr>";

        DOM.tableBody.insertAdjacentHTML("beforeend", html);

        UI.toggleDataTable();
      }
    }, {
      key: "removeCourse",
      value: function removeCourse(el) {
        if (el.classList.contains("fa-times") || el.classList.contains("btn-delete-row")) {
          el.closest("tr").remove();
          return el.closest("tr").dataset.courseId;
        }
      }
    }, {
      key: "clearFields",
      value: function clearFields() {
        document.querySelector(".class").value = "";
        document.querySelector(".unit").value = "";
        document.querySelector(".grade").value = "";
      }
    }]);

    return UI;
  }();

  var GpaCalculator = function () {
    function GpaCalculator() {
      _classCallCheck(this, GpaCalculator);
    }

    _createClass(GpaCalculator, null, [{
      key: "calculateGpa",
      value: function calculateGpa() {
        // prettier-ignore
        var letterGradeValue = {
          "A": 4,
          "A-": 3.7,
          "B+": 3.3,
          "B": 3,
          "B-": 2.7,
          "C+": 2.3,
          "C": 2,
          "C-": 1.7,
          "D+": 1.3,
          "D": 1,
          "F": 0
        };

        var totalUnits = 0;
        var totalPoints = 0;
        var gpa = 0;

        var courses = Store.getCourses();

        var gradesArr = courses.map(function (courseDataObj) {
          return courseDataObj["grade"];
        });
        var unitsArr = courses.map(function (courseDataObj) {
          return courseDataObj["unit"];
        });

        // Convert letter grades to numeric grades
        var numGrades = gradesArr.map(function (char) {
          return letterGradeValue[char];
        });

        // Calculate GPA
        totalUnits = unitsArr.reduce(function (acc, val) {
          return acc + +val;
        }, 0);
        totalPoints = numGrades.map(function (num, i) {
          return num * unitsArr[i];
        });
        gpa = totalPoints.reduce(function (acc, point) {
          return acc + point;
        }, 0) / totalUnits;
        gpa = gpa.toFixed(2);

        return gpa;
      }
    }]);

    return GpaCalculator;
  }();

  DOM.checkBox.addEventListener("click", function () {
    UI.switchThemeColor();
  });

  DOM.form.addEventListener("submit", function (e) {
    e.preventDefault();

    var course = document.querySelector(".class").value.trim();
    var unit = document.querySelector(".unit").value.trim();
    var grade = document.querySelector(".grade").value.trim();

    var randomId = Date.now();
    var modalTitle = "Please fill in all fields carefully!";
    var modalMsg = [];

    if (!course) {
      modalMsg.push("Please add your course name!");
    }

    if (!unit) {
      modalMsg.push("Please add your course units!");
    } else if (isNaN(+unit) || +unit <= 0) {
      modalMsg.push("Only numeric characters ( >= 1) are allowed in the 'Units' field.");
    }

    if (!grade) {
      modalMsg.push("Please add your letter grade!");
    }

    if (modalMsg.length > 0) {
      UI.displayModal(modalTitle, modalMsg);
      return;
    }

    var formatUnit = Math.floor(unit);
    var courseDataObj = new CourseData(course, formatUnit, grade, randomId);

    Store.addCourse(courseDataObj);

    UI.addToResultTable(courseDataObj);

    UI.clearFields();
  });

  DOM.resetBtn.addEventListener("click", function () {
    Store.clearLocalStorage();
  });

  DOM.resultTable.addEventListener("click", function (e) {
    var element = e.target;

    var id = UI.removeCourse(element);

    Store.removeCourseFromLocalStorage(id);

    UI.toggleDataTable();
  });

  document.addEventListener("DOMContentLoaded", function () {
    var themeColor = Store.getThemeColor();

    UI.displayCourses();

    UI.updateCourseCounter();

    UI.updateGpa();

    document.documentElement.setAttribute("data-theme", themeColor);
    themeColor === "dark" ? DOM.checkBox.checked = true : DOM.checkBox.checked = false;
  });
})();