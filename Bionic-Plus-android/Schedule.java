public class Schedule{
    public LinkedList<String> classList;
    public Schedule(){
        classList = new LinkedList<>();
    }
    public void addClass(Schedule s, String className){
        s.classList.add(className);
    }
    public void removeClass(Schedule s, string className){
        if (s.classList.contains(className)){
            s.remove(className);
        }
    }
}