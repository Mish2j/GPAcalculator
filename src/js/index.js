"use strict";
(function () {
  const DOM = {
    checkBox: document.querySelector(".checkBox"),
    resultTable: document.querySelector(".table"),
    tableBody: document.querySelector(".table-body"),
    form: document.querySelector(".gpa-form"),
    resetBtn: document.querySelector(".btn-reset"),
  };

  class CourseData {
    constructor(course, unit, grade, id) {
      this.course = course;
      this.grade = grade;
      this.unit = unit;
      this.id = id;
    }
  }

  class Store {
    static getCourses() {
      let courses;
      if (localStorage.getItem("courses") === null) {
        courses = [];
      } else {
        courses = JSON.parse(localStorage.getItem("courses"));
      }

      return courses;
    }

    static addCourse(course) {
      const courses = this.getCourses();

      courses.push(course);

      localStorage.setItem("courses", JSON.stringify(courses));

      UI.updateCourseCounter();
      UI.updateGpa();
    }

    static removeCourseFromLocalStorage(id) {
      const courses = this.getCourses();

      const filteredCourses = courses.filter((course) => course.id != id);

      localStorage.setItem("courses", JSON.stringify(filteredCourses));

      UI.updateCourseCounter();

      UI.updateGpa();
    }

    static clearLocalStorage() {
      localStorage.removeItem("courses");

      UI.toggleDataTable();

      UI.updateCourseCounter();

      UI.updateGpa();
    }

    static getThemeColor() {
      let themeColor = "";

      if (localStorage.getItem("theme") === null) {
        themeColor = "light";
      } else {
        themeColor = JSON.parse(localStorage.getItem("theme"));
      }

      return themeColor;
    }

    static setThemeColor(color) {
      localStorage.setItem("theme", JSON.stringify(color));
    }
  }

  class UI {
    static toggleDataTable() {
      const resultCont = document.querySelector(".table-container");

      const courses = Store.getCourses();

      if (courses.length > 0) {
        resultCont.classList.remove("hidden");
      } else {
        DOM.tableBody.innerHTML = "";
        resultCont.classList.add("hidden");
      }
    }

    static updateCourseCounter() {
      const courseCounter = Store.getCourses().length + 1;
      document.querySelector(".class-count").textContent = courseCounter;
    }

    static updateGpa() {
      document.querySelector(".gpa").textContent = GpaCalculator.calculateGpa();
    }

    static switchThemeColor() {
      let themeColor = "";

      DOM.checkBox.checked ? (themeColor = "dark") : (themeColor = "light");

      document.documentElement.setAttribute("data-theme", themeColor);
      Store.setThemeColor(themeColor);
    }

    static displayCourses() {
      const courses = Store.getCourses();

      UI.toggleDataTable();

      courses.forEach((course) => this.addToResultTable(course));
    }

    static displayModal(title, messages = []) {
      const warnModal = document.querySelector(".warning-modal");
      const modalTextBox = warnModal.querySelector(".modal-text");
      const overlay = document.querySelector(".overlay");
      const btnCloseModal = document.querySelector(".btn-close-modal");

      const headingEl = document.createElement("h3");
      const headingText = document.createTextNode(title);
      headingEl.appendChild(headingText);

      title && modalTextBox.insertAdjacentElement("afterbegin", headingEl);

      messages.forEach((msg) => {
        const msgEl = document.createElement("p");
        const msgText = document.createTextNode(msg);
        msgEl.appendChild(msgText);
        modalTextBox.insertAdjacentElement("beforeend", msgEl);
      });

      warnModal.classList.toggle("hidden");
      overlay.classList.toggle("hidden");

      const hideModal = function () {
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

    static addToResultTable(courseData) {
      const html = `
        <tr data-course-id=${courseData.id}>
          <td>${courseData.course}</td>
          <td class="class_unit">${courseData.unit}</td>
          <td class="class_grade">${courseData.grade}</td>
          <td>
            <button class="btn btn-delete-row">
              <i class="fas fa-times"></i>
            </button>
          </td>
        </tr>`;

      DOM.tableBody.insertAdjacentHTML("beforeend", html);

      UI.toggleDataTable();
    }

    static removeCourse(el) {
      if (
        el.classList.contains("fa-times") ||
        el.classList.contains("btn-delete-row")
      ) {
        el.closest("tr").remove();
        return el.closest("tr").dataset.courseId;
      }
    }

    static clearFields() {
      document.querySelector(".class").value = "";
      document.querySelector(".unit").value = "";
      document.querySelector(".grade").value = "";
    }
  }

  class GpaCalculator {
    static calculateGpa() {
      // prettier-ignore
      const letterGradeValue = {
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
        "F": 0,
      };

      let totalUnits = 0;
      let totalPoints = 0;
      let gpa = 0;

      const courses = Store.getCourses();

      const gradesArr = courses.map((courseDataObj) => courseDataObj["grade"]);
      const unitsArr = courses.map((courseDataObj) => courseDataObj["unit"]);

      // Convert letter grades to numeric grades
      const numGrades = gradesArr.map((char) => letterGradeValue[char]);

      // Calculate GPA
      totalUnits = unitsArr.reduce((acc, val) => acc + +val, 0);
      totalPoints = numGrades.map((num, i) => num * unitsArr[i]);
      gpa = totalPoints.reduce((acc, point) => acc + point, 0) / totalUnits;
      gpa = gpa.toFixed(2);

      return gpa;
    }
  }

  DOM.checkBox.addEventListener("click", function () {
    UI.switchThemeColor();
  });

  DOM.form.addEventListener("submit", function (e) {
    e.preventDefault();

    const course = document.querySelector(".class").value.trim();
    const unit = document.querySelector(".unit").value.trim();
    const grade = document.querySelector(".grade").value.trim();

    const randomId = Date.now();
    let modalTitle = "Please fill in all fields carefully!";
    let modalMsg = [];

    if (!course) {
      modalMsg.push("Please add your course name!");
    }

    if (!unit) {
      modalMsg.push("Please add your course units!");
    } else if (isNaN(+unit) || +unit <= 0) {
      modalMsg.push(
        "Only numeric characters ( >= 1) are allowed in the 'Units' field."
      );
    }

    if (!grade) {
      modalMsg.push("Please add your letter grade!");
    }

    if (modalMsg.length > 0) {
      UI.displayModal(modalTitle, modalMsg);
      return;
    }

    const formatUnit = Math.floor(unit);
    const courseDataObj = new CourseData(course, formatUnit, grade, randomId);

    Store.addCourse(courseDataObj);

    UI.addToResultTable(courseDataObj);

    UI.clearFields();
  });

  DOM.resetBtn.addEventListener("click", function () {
    Store.clearLocalStorage();
  });

  DOM.resultTable.addEventListener("click", function (e) {
    const element = e.target;

    const id = UI.removeCourse(element);

    Store.removeCourseFromLocalStorage(id);

    UI.toggleDataTable();
  });

  document.addEventListener("DOMContentLoaded", () => {
    const themeColor = Store.getThemeColor();

    UI.displayCourses();

    UI.updateCourseCounter();

    UI.updateGpa();

    document.documentElement.setAttribute("data-theme", themeColor);
    themeColor === "dark"
      ? (DOM.checkBox.checked = true)
      : (DOM.checkBox.checked = false);
  });
})();
