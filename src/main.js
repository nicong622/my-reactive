const bucket = new WeakMap()

const data = {
  name: 'cong',
  age: 29
}

function track(target, prop) {
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }

  let deps = depsMap.get(prop);
  if (!deps) {
    depsMap.set(prop, activeEffect)
  }
}

function trigger(target, prop) {
  const depsMap = bucket.get(target);

  if (depsMap) {
    const fn = depsMap.get(prop);

    if (fn) {
      fn()
    }
  }
}

const refData = new Proxy(data, {
  get(target, prop) {
    track(target, prop)

    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;

    trigger(target, prop);

    return true;
  }
})

let activeEffect;
function effect(fn) {
  activeEffect = () => {
    fn()
  }
  activeEffect()
}

function sayHello() {
  console.log(refData.name)
}

effect(sayHello)

refData.name = 'susie'