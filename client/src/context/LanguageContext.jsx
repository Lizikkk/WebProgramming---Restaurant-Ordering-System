import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const translations = {
  ka: {
    'Menu': 'მენიუ', 'A taste of Georgia, made to be shared.': 'ქართული გემო, რომელიც გაზიარებისთვის შეიქმნა.', 'Georgian cuisine': 'ქართული სამზარეულო', 'Image coming soon': 'ფოტო მალე დაემატება', 'Appetizers': 'წასახემსებლები', 'Main Dish': 'ძირითადი კერძები', 'Main Courses': 'ძირითადი კერძები', 'Desserts': 'დესერტები', 'Drinks': 'სასმელები', 'Starters': 'საწყისი კერძები', 'khachapuri': 'ხაჭაპური', 'Khachapuri': 'ხაჭაპური', 'khinkali': 'ხინკალი', 'lobiani': 'ლობიანი', 'mtsvadi': 'მწვადი', 'Team': 'ჩვენი გუნდი', 'MyAccount': 'ჩემი ანგარიში', 'My account': 'ჩემი ანგარიში',
    'Contact': 'კონტაქტი', 'Georgian Restaurant': 'ქართული რესტორანი', 'Made by Georgians.': 'შექმნილია ქართველების მიერ.',
    'Enjoyed by Everyone.': 'საყვარელია ყველასთვის.', 'Ketili Ikos Tqveni Mobrdzaneba': 'კეთილი იყოს თქვენი მობრძანება',
    'Welcome to our table.': 'კეთილი იყოს თქვენი მობრძანება ჩვენს სუფრასთან.', 'Made with Georgian hospitality.': 'ქართული სტუმართმოყვარეობით შექმნილი.',
    'Explore the menu': 'მენიუს ნახვა', 'Our team': 'ჩვენი გუნდი', 'Open navigation menu': 'ნავიგაციის გახსნა', 'Close navigation menu': 'ნავიგაციის დახურვა',
    'Login': 'შესვლა', 'Register': 'რეგისტრაცია', 'Create Account': 'ანგარიშის შექმნა', 'Full Name': 'სრული სახელი', 'Email': 'ელფოსტა',
    'Password (min 6 chars)': 'პაროლი (მინ. 6 სიმბოლო)', 'Need an account? Register': 'არ გაქვთ ანგარიში? დარეგისტრირდით',
    'Already have an account? Login': 'უკვე გაქვთ ანგარიში? შედით', 'Search dishes by name or description...': 'მოძებნეთ კერძი სახელით ან აღწერით...',
    'All': 'ყველა', 'Add to Cart': 'კალათაში დამატება', 'Your Cart': 'თქვენი კალათა', 'Your cart is empty.': 'თქვენი კალათა ცარიელია.',
    'Total': 'ჯამი', 'Place Order': 'შეკვეთის განთავსება', 'Login to Order': 'შეკვეთისთვის შედით', 'No dishes match your filter.': 'თქვენს ძიებას კერძები არ შეესაბამება.',
    'Order placed successfully! View it in My Orders.': 'შეკვეთა წარმატებით განთავსდა! იხილეთ ჩემი შეკვეთების გვერდზე.',
    'My Orders': 'ჩემი შეკვეთები', 'You have not placed any orders yet.': 'შეკვეთები ჯერ არ გაქვთ.', 'Cancel Order': 'შეკვეთის გაუქმება',
    'New': 'ახალი', 'Preparing': 'მზადდება', 'Ready': 'მზადაა', 'Delivered': 'მიტანილია', 'Order': 'შეკვეთა', 'Cancel': 'გაუქმება', 'Delete': 'წაშლა',
    'Date': 'თარიღი', 'Status': 'სტატუსი', 'Ordered Items': 'შეკვეთილი კერძები', 'No image available': 'სურათი მიუწვდომელია',
    'Kitchen Orders Board': 'სამზარეულოს შეკვეთები', 'Refresh Orders': 'შეკვეთების განახლება', 'Move to': 'გადატანა:',
    'Admin Dashboard': 'ადმინისტრატორის პანელი', 'Menu Items': 'კერძები', 'Categories': 'კატეგორიები', 'Orders': 'შეკვეთები',
    'Users & Roles': 'მომხმარებლები და როლები', 'Edit Menu Item': 'კერძის რედაქტირება', 'Add Menu Item': 'კერძის დამატება',
    'Select Category': 'აირჩიეთ კატეგორია', 'Dish Name': 'კერძის სახელი', 'Description': 'აღწერა', 'Price ($)': 'ფასი ($)',
    'Edit Category': 'კატეგორიის რედაქტირება', 'Add Category': 'კატეგორიის დამატება', 'Category Name': 'კატეგორიის სახელი',
    'Display Order': 'ჩვენების რიგი', 'Update Category': 'კატეგორიის განახლება', 'Update Menu Item': 'კერძის განახლება',
    'Customer': 'მომხმარებელი', 'Staff': 'პერსონალი', 'Admin': 'ადმინისტრატორი', 'Actions': 'მოქმედებები', 'Refresh': 'განახლება',
    'Team & Story': 'ჩვენი გუნდი და ისტორია', 'A table full of stories': 'სუფრა, რომელიც ისტორიებს აერთიანებს',
    'We bring Georgian hospitality to every guest, with recipes, traditions and the joy of sharing food.': 'თითოეულ სტუმარს ქართულ სტუმართმოყვარეობას ვუზიარებთ — ტრადიციული რეცეპტებითა და ერთად ყოფნის სიხარულით.',
    'Our philosophy': 'ჩვენი ხედვა', 'Food tastes better when shared.': 'საჭმელი უფრო გემრიელია, როცა მას ერთად ვუზიარებთ.',
    'Contact us': 'დაგვიკავშირდით','Get in touch': 'დაგვიკავშირდით','Contact Us': 'კონტაქტი','We would love to welcome you to our table.': 'მოხარულები ვიქნებით, თუ ჩვენს სუფრას ესტუმრებით.','Working Hours': 'სამუშაო საათები','Monday – Sunday': 'ორშაბათი – კვირა','Hours to be confirmed': 'სამუშაო საათები დაზუსტდება','Phone': 'ტელეფონი','Call us for reservations and questions.': 'დაგვიკავშირდით ჯავშნებისა და კითხვებისთვის.','Phone number to be added': 'ტელეფონის ნომერი დაემატება','Location': 'მისამართი','Come and visit us.': 'გვეწვიეთ ჩვენს რესტორანში.','Address to be added': 'მისამართი დაემატება','Send us your questions.': 'მოგვწერეთ თქვენი კითხვები.','Email address to be added': 'ელფოსტის მისამართი დაემატება', 'Back to home': 'მთავარ გვერდზე დაბრუნება', 'Home': 'მთავარი', 'MyBasket': 'კალათა',
    'Logout': 'გასვლა', 'ID': 'ID', 'Items': 'კერძები', 'Order #': 'შეკვეთა №', 'Role': 'როლი', 'Name': 'სახელი', 'Manage All Orders': 'ყველა შეკვეთის მართვა', 'Manage User Roles': 'მომხმარებლების როლების მართვა', 'Are you sure you want to cancel Order': 'ნამდვილად გსურთ შეკვეთის გაუქმება', 'Confirm Delete': 'წაშლის დადასტურება',
    'Are you sure you want to delete this item?': 'ნამდვილად გსურთ ამ ელემენტის წაშლა?',
    'Main Dishes': 'ძირითადი კერძები', 'Menu categories': 'მენიუს კატეგორიები', 'Loading menu...': 'მენიუ იტვირთება...',
    'Price (₾)': 'ფასი (₾)', 'Georgian menu setup': 'ქართული მენიუს მომზადება',
    'Add the agreed Georgian dishes and drinks using the existing API. Existing sample dishes will be hidden, not deleted.': 'დაამატეთ შეთანხმებული ქართული კერძები და სასმელები არსებული API-ის გამოყენებით. ძველი სატესტო კერძები დაიმალება და არ წაიშლება.',
    'Populate Georgian Menu': 'ქართული მენიუს დამატება', 'Adding menu...': 'მენიუ ემატება...',
    'Badrijani Nigvzit': 'ბადრიჯანი ნიგვზით', 'Pkhali Selection': 'ფხეულის ასორტი', 'Georgian Salad with Walnuts': 'ქართული სალათი ნიგვზით',
    'Jonjoli': 'ჯონჯოლი', 'Satsivi': 'საცივი', 'Gebzhalia': 'გებჟალია', 'Mchadi': 'მჭადი', 'Sulguni Cheese': 'სულგუნი',
    'Adjarian Khachapuri': 'აჭარული ხაჭაპური', 'Imeretian Khachapuri': 'იმერული ხაჭაპური', 'Megruli Khachapuri': 'მეგრული ხაჭაპური',
    'Khinkali': 'ხინკალი', 'Cheese Khinkali': 'ყველის ხინკალი', 'Lobiani': 'ლობიანი', 'Mtsvadi': 'მწვადი', 'Ojakhuri': 'ოჯახური',
    'Chakapuli': 'ჩაქაფული', 'Chashushuli': 'ჩაშუშული', 'Shkmeruli': 'შქმერული', 'Kharcho': 'ხარჩო',
    'Churchkhela': 'ჩურჩხელა', 'Pelamushi': 'ფელამუში', 'Gozinaki': 'გოზინაყი', 'Kada': 'ქადა', 'Nazuki': 'ნაზუქი',
    'Tarkhuna Lemonade': 'ტარხუნის ლიმონათი', 'Pear Lemonade': 'მსხლის ლიმონათი', 'Lemon Lemonade': 'ლიმონის ლიმონათი',
    'Natakhtari Lemonade': 'ნატახტარის ლიმონათი', 'Borjomi': 'ბორჯომი', 'Nabeghlavi': 'ნაბეღლავი', 'Homemade Fruit Compote': 'სახლის ხილის კომპოტი',
    'Eggplant rolls filled with seasoned walnut paste and pomegranate.': 'ბადრიჯნის რულეტები ნიგვზის გულსართითა და ბროწეულით.',
    'Traditional spinach, beet and vegetable pâtés with walnuts.': 'ისპანახის, ჭარხლისა და სხვა ბოსტნეულის ფხეული ნიგვზით.',
    'Fresh tomatoes, cucumber, herbs and crushed walnuts.': 'ახალი პომიდორი, კიტრი, მწვანილი და დაჭრილი ნიგოზი.',
    'Traditional Georgian pickled jonjoli with herbs and oil.': 'ქართული ტრადიციული დამწნილებული ჯონჯოლი მწვანილითა და ზეთით.',
    'Tender chicken served in a rich, aromatic walnut sauce.': 'ნაზი ქათმის ხორცი ნიგვზის არომატულ სოუსში.',
    'Minty cheese rolls served with a delicate dairy sauce.': 'პიტნით შეზავებული ყველის რულეტები რძის ნაზ სოუსში.',
    'Traditional Georgian cornbread, baked until golden.': 'ტრადიციული ქართული მჭადი, ოქროსფრად გამომცხვარი.',
    'Slices of traditional Georgian brined cheese.': 'ტრადიციული ქართული მარილწყალში დამწიფებული ყველის ნაჭრები.',
    'Boat-shaped bread filled with cheese, topped with egg and butter.': 'ნავის ფორმის ყველიანი ცომი კვერცხითა და კარაქით.',
    'Soft golden bread filled with Imeretian cheese.': 'რბილი, ოქროსფრად გამომცხვარი პური იმერული ყველის გულსართით.',
    'Cheese-filled bread with an extra layer of cheese on top.': 'ყველით სავსე ცომი, ზემოდან დამატებითი ყველის ფენით.',
    'Juicy Georgian dumplings with seasoned meat and broth.': 'წვნიანი ქართული ცომის ხინკალი შეზავებული ხორცითა და ბულიონით.',
    'Georgian dumplings filled with melted cheese.': 'ქართული ცომის ხინკალი გამდნარი ყველის გულსართით.',
    'Traditional baked bread filled with seasoned beans.': 'ტრადიციული გამომცხვარი პური შეზავებული ლობიოს გულსართით.',
    'Charcoal-grilled meat skewers with onion and fresh herbs.': 'ნაკერჩხალზე შემწვარი ხორცი ხახვითა და ახალი მწვანილით.',
    'Pan-fried meat and potatoes with Georgian spices.': 'ტაფაზე შემწვარი ხორცი და კარტოფილი ქართული სანელებლებით.',
    'Aromatic seasonal stew with tarragon, herbs and sour plum.': 'არომატული სეზონური ჩაშუშული ტარხუნით, მწვანილითა და ტყემლით.',
    'Slow-cooked beef stew with tomatoes and Georgian spices.': 'ნელ ცეცხლზე მომზადებული საქონლის ხორცი პომიდვრითა და ქართული სანელებლებით.',
    'Chicken in a rich garlic and milk sauce.': 'ქათამი ნივრისა და რძის სქელ სოუსში.',
    'Traditional Georgian beef soup with rice, herbs and spices.': 'ტრადიციული ქართული საქონლის ხორცის წვნიანი ბრინჯით, მწვანილითა და სანელებლებით.',
    'Walnuts threaded on a string and coated in thickened grape juice.': 'ძაფზე აცმული ნიგოზი, დაფარული შესქელებული ყურძნის წვენით.',
    'Traditional Georgian grape pudding.': 'ტრადიციული ქართული ყურძნის პუდინგი.',
    'Crunchy walnuts bound with golden honey.': 'ხრაშუნა ნიგოზი თაფლით.',
    'Traditional Georgian pastry with a sweet, buttery filling.': 'ტრადიციული ქართული ცომეული ტკბილი, კარაქიანი გულსართით.',
    'Sweet Georgian bread scented with warm spices.': 'ტკბილი ქართული პური არომატული სანელებლებით.',
    'Classic Georgian tarragon lemonade.': 'კლასიკური ქართული ტარხუნის ლიმონათი.',
    'Refreshing Georgian-style pear lemonade.': 'გამაგრილებელი ქართული მსხლის ლიმონათი.',
    'Fresh and sparkling lemon lemonade.': 'ახალი, გაზიანი ლიმონის ლიმონათი.',
    'Popular Georgian bottled lemonade.': 'პოპულარული ქართული ჩამოსხმული ლიმონათი.',
    'Naturally carbonated Georgian mineral water.': 'ბუნებრივად გაზიანი ქართული მინერალური წყალი.',
    'Georgian sparkling mineral water.': 'ქართული გაზიანი მინერალური წყალი.',
    'Traditional chilled fruit compote, made in-house.': 'ადგილზე მომზადებული ტრადიციული, გაცივებული ხილის კომპოტი.'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('restaurant_language');
    return saved === 'ka' ? 'ka' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('restaurant_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => setLanguage((current) => current === 'en' ? 'ka' : 'en');
  const t = (value) => language === 'ka' ? (translations.ka[value] || value) : value;
  const value = useMemo(() => ({ language, toggleLanguage, t }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
