let length;
let num_elements = 20;
const element_height = 20;
let wire_x;
let wire_y;
let elements = [];
let k = 60;
let point;

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(2);
  length = windowWidth * 0.4;
  wire_x = windowWidth * 0.3;
  wire_y = windowHeight * 0.6;
  let element_width = length / num_elements;
  for (let i = 0; i < num_elements; i++) {
    elements.push(
      new Element(wire_x + i * element_width, wire_y,
                  element_width, element_height)
    );
  }
  point = new Point(windowWidth / 2, windowHeight * 0.4);
  noLoop();
}

function draw() {
  background(255);
  point.field.set(0, 0);
  for (let element of elements) {
    if (element.selected) {
      element.computeField(point.x, point.y);
      point.field.add(element.field.x, element.field.y);
    }
    element.show();
  }
  point.show();
}

function mousePressed() {
  if (point.contains(mouseX, mouseY)) {
    point.dragged = true;
  } else {
    for (let element of elements) {
      if (element.contains(mouseX, mouseY)) {
        element.selected = !element.selected;
      }
    }
  }
  redraw();
}

function mouseDragged() {
  if (point.dragged) {
    point.x = mouseX;
    point.y = mouseY;
  } else {
    for (let element of elements) {
      if (element.contains(mouseX, mouseY)) {
        element.selected = true;
      }
    }
  }
  redraw();
}

function doubleClicked() {
  let all_selected = true;
  for (let element of elements) {
    all_selected = all_selected && element.selected;
  }
  for (let element of elements) {
    if (element.contains(mouseX, mouseY)) {
      for (let elem of elements) {
        elem.selected = !all_selected;
      }
      break;
    }
  }
  redraw();
}

function mouseReleased() {
  point.dragged = false;
}

function numElementsChanged() {
  let num_elements_slider = document.getElementById("num_elements_slider");
  num_elements = Number(num_elements_slider.value);
  let element_width = length / num_elements;
  new_elements = [];
  for (let i = 0; i < num_elements; i++) {
    element = new Element(wire_x + i * element_width, wire_y, element_width, element_height);
    for (let old_element of elements) {
      if (old_element.selected && abs(element.x - old_element.x) < 0.75 * element_width) {
        element.selected = true;
      }
    }
    new_elements.push(element);
  }
  elements = new_elements;
  let label = document.getElementById("num_elements");
  label.innerHTML = num_elements;
  redraw();
}

p5.Vector.prototype.show = function(x = 0, y = 0) {
  push();
  translate(x, y);
  line(0, 0, this.x, this.y);
  // Draw arrow head
  let angle = atan2(-this.y, -this.x);
  translate(this.x, this.y);
  rotate(angle - HALF_PI);
  triangle(-2, 0, 2, 0, 0, -8);
  pop();
};

class Element {
  constructor(x, y, width, height) {
    this.position = createVector(x + width / 2, y + height / 2);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.selected = false;
    this.field = createVector(10, 10);
  }

  computeField(x, y) {
    this.field.set(x - this.position.x, y - this.position.y);
    this.field.mult(k * this.width / this.field.magSq());
  }

  contains(x, y) {
    return x >= this.x &&
           x <= this.x + this.width &&
           y >= this.y &&
           y <= this.y + this.height;
  }

  show() {
    if (this.selected) {
      // Color the line element and draw corresponding field element
      fill(205, 152, 136);
      stroke(183, 106, 82);
      this.field.show(point.x, point.y);
    } else {
      fill(136, 177, 205);
      stroke(82, 141, 183);
    }
    rect(this.x, this.y, this.width, this.height);
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.field = createVector(0, 0);
    this.dragged = false;
  }

  show() {
    fill(130);
    stroke(0);
    ellipse(this.x, this.y, 5, 5);
    if (this.field.magSq() > 0) {
      stroke(0);
      this.field.show(this.x, this.y);
    }
  }

  contains(x, y) {
    return (x - this.x)**2 + (y - this.y)**2 <= 36;
  }
}
