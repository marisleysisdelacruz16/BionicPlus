import java.util.LinkedList;

public class Schedule{
    public LinkedList<String> classList;
    public Schedule(){
        classList = new LinkedList<>();
    }
    public List<String> getSchedule(){
        return classList;
    }
    public void addClass(String className){
        classList.add(className);
    }
    public void removeClass(String className){
        if (classList.contains(className)){
            classList.remove(className);
        }
    }
    public static void main(String[] args){
        Schedule s = new Schedule();
        System.out.println(s.classList);
        s.addClass("CHEM101");
        System.out.println(s.classList);
    }
}